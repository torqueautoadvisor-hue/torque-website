import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'one';
  const cmpId = searchParams.get('cmp');
  const ctgId = searchParams.get('ctg');

  if (!cmpId || !ctgId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Determine correct database table based on calculator index
  let tableName = 'qutrel_one_detail';
  if (type === 'two') tableName = 'qutrel_two_detail';
  if (type === 'three') tableName = 'qutrel_three_detail';

  try {
    const query = `SELECT qtr_percentage, qtr_profit, qtr_remarks 
                   FROM "${tableName}" 
                   WHERE cmp_id = $1 AND ctg_id = $2`;
    
    const res = await db.query(query, [parseInt(cmpId), parseInt(ctgId)]);

    if (res.rows.length > 0) {
      return NextResponse.json({
        qtr_percentage: res.rows[0].qtr_percentage,
        qtr_profit: res.rows[0].qtr_profit,
        qtr_remarks: res.rows[0].qtr_remarks
      });
    } else {
      return NextResponse.json({
        qtr_percentage: '',
        qtr_profit: '',
        qtr_remarks: ''
      });
    }
  } catch (err: any) {
    console.error('Error fetching calculator rules:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
