'use client';

import { useState, useEffect } from 'react';

export interface Company {
  cmp_id: number;
  cmp_name: string;
}

export interface Category {
  ctg_id: number;
  ctg_name: string;
}

export default function CalculatorForm({
  calculatorType,
  companies,
  categories,
}: {
  calculatorType: 'one' | 'two' | 'three';
  companies: Company[];
  categories: Category[];
}) {
  const [cmpId, setCmpId] = useState('');
  const [ctgId, setCtgId] = useState('');
  const [netPremium, setNetPremium] = useState('');
  const [totalPremium, setTotalPremium] = useState('');

  const [percentage, setPercentage] = useState(0);
  const [profit, setProfit] = useState(0);
  const [remarks, setRemarks] = useState('');

  const [rate, setRate] = useState<number | string>('');
  const [benefit, setBenefit] = useState<number | string>('');

  // Fetch Pricing Rules via AJAX
  useEffect(() => {
    if (cmpId && ctgId) {
      fetch(`/api/calculator-rules?type=${calculatorType}&cmp=${cmpId}&ctg=${ctgId}`)
        .then((res) => res.json())
        .then((data) => {
          setPercentage(parseFloat(data.qtr_percentage) || 0);
          setProfit(parseFloat(data.qtr_profit) || 0);
          setRemarks(data.qtr_remarks || '');
        })
        .catch((err) => console.error('Error fetching pricing data:', err));
    } else {
      setPercentage(0);
      setProfit(0);
      setRemarks('');
    }
  }, [cmpId, ctgId, calculatorType]);

  // Reactive Math formulas
  useEffect(() => {
    const net = parseFloat(netPremium) || 0;
    const total = parseFloat(totalPremium) || 0;

    if (percentage > 0 && profit > 0 && net > 0 && total > 0) {
      const calculatedRate = total - (net * (percentage / 100)) + profit;
      setRate(Math.round(calculatedRate));
      
      const calculatedBenefit = total - calculatedRate;
      setBenefit(Math.round(calculatedBenefit));
    } else {
      setRate('');
      setBenefit('');
    }
  }, [netPremium, totalPremium, percentage, profit]);

  const getCalculatorTitle = () => {
    if (calculatorType === 'two') return 'Rate Calculator - 2';
    if (calculatorType === 'three') return 'Rate Calculator - 3';
    return 'Rate Calculator - 1';
  };

  const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="contentpanel">
      <div className="row">
        <div className="col-md-12">
          <form className="form-horizontal">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h4 className="panel-title">{getCalculatorTitle()}</h4>
              </div>
              <div className="panel-body">
                {/* Date */}
                <div className="form-group">
                  <label className="col-sm-3 control-label">Date</label>
                  <div className="col-sm-9">
                    <input
                      type="date"
                      className="form-control"
                      value={getTodayDate()}
                      readOnly
                    />
                  </div>
                </div>

                {/* Company Select */}
                <div className="form-group">
                  <label className="col-sm-3 control-label">Company</label>
                  <div className="col-sm-9">
                    <select
                      className="form-control"
                      value={cmpId}
                      onChange={(e) => setCmpId(e.target.value)}
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map((c) => (
                        <option key={c.cmp_id} value={c.cmp_id}>
                          {c.cmp_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Select */}
                <div className="form-group">
                  <label className="col-sm-3 control-label">Category</label>
                  <div className="col-sm-9">
                    <select
                      className="form-control"
                      value={ctgId}
                      onChange={(e) => setCtgId(e.target.value)}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.ctg_id} value={c.ctg_id}>
                          {c.ctg_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Remarks (read-only) */}
                <div className="form-group">
                  <label className="col-sm-3 control-label">Remarks</label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ex: Remarks"
                      value={remarks}
                      readOnly
                    />
                  </div>
                </div>

                {/* Net Premium */}
                <div className="form-group">
                  <label className="col-sm-3 control-label">Net Premium</label>
                  <div className="col-sm-9">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="ex: 30000"
                      value={netPremium}
                      onChange={(e) => setNetPremium(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Total Premium */}
                <div className="form-group">
                  <label className="col-sm-3 control-label">Total Premium</label>
                  <div className="col-sm-9">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="ex: 34000"
                      value={totalPremium}
                      onChange={(e) => setTotalPremium(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Rate Result */}
                <div className="form-group">
                  <label className="col-sm-3 control-label">Rate</label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      className="form-control"
                      value={rate}
                      placeholder="Calculated Rate"
                      readOnly
                    />
                  </div>
                </div>

                {/* Benefit Result */}
                <div className="form-group">
                  <label className="col-sm-3 control-label">Benefit</label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      className="form-control"
                      value={benefit}
                      placeholder="Calculated Benefit"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
