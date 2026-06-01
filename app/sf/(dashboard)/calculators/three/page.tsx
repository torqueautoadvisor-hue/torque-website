import { db } from '../../../../../lib/db';
import CalculatorForm from '../../../../../components/shared/CalculatorForm';

export default async function CalculatorThreePage() {
  // Query active companies and categories directly server-side
  const cmpRes = await db.query('SELECT cmp_id, cmp_name FROM company_detail WHERE cmp_status = 1');
  const ctgRes = await db.query('SELECT ctg_id, ctg_name FROM category_detail WHERE ctg_status = 1');

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-plus"></i> Rate Calculator - 3</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/insurance">Dashboard</a></li>
            <li className="active">Rate Calculator - 3</li>
          </ol>
        </div>
      </div>

      <CalculatorForm 
        calculatorType="three" 
        companies={cmpRes.rows} 
        categories={ctgRes.rows} 
      />
    </div>
  );
}
