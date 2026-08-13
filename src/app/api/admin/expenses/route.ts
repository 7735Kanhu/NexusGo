import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Expense } from '@/lib/models/Expense';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const deliveryBoyId = searchParams.get('deliveryBoyId');

    const query: any = {};
    if (category && category !== 'ALL') {
      query.category = category;
    }
    if (deliveryBoyId && deliveryBoyId !== 'ALL') {
      query.relatedDeliveryBoyId = deliveryBoyId;
    }

    const expenses = await Expense.find(query)
      .populate('relatedDeliveryBoyId', 'deliveryBoyId fullName phone')
      .sort({ date: -1 });

    const totalExpense = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return NextResponse.json({
      success: true,
      totalExpense,
      expenses,
    });
  } catch (error: any) {
    console.error('Fetch expenses error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.category || !body.amount) {
      return NextResponse.json({ error: 'Expense Category and Amount are required' }, { status: 400 });
    }

    const amount = Number(body.amount);
    if (amount <= 0) {
      return NextResponse.json({ error: 'Expense amount must be greater than 0' }, { status: 400 });
    }

    const newExpense = await Expense.create({
      category: body.category,
      amount,
      date: body.date || new Date().toISOString().split('T')[0],
      description: body.description || '',
      receipt: body.receipt || '',
      relatedDeliveryBoyId: body.relatedDeliveryBoyId || null,
      notes: body.notes || '',
    });

    await logAudit({
      action: 'ADD_EXPENSE',
      details: `Added business expense of ₹${amount} under category ${body.category}`,
      newValue: newExpense.toObject(),
    });

    return NextResponse.json({
      success: true,
      message: 'Expense recorded successfully',
      expense: newExpense,
    });
  } catch (error: any) {
    console.error('Create expense error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
