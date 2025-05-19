import React, { useState } from 'react';
import axios from 'axios';
import Loader from '../components/Common/Loader';
import ErrorMessage from '../components/Common/ErrorMessage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Reports = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [reportType, setReportType] = useState('general');
 const [report, setReport] = useState(null);
 const [dateRange, setDateRange] = useState({
   startDate: '',
   endDate: ''
 });

 const handleGenerateReport = async () => {
   setLoading(true);
   setError(null);
   setReport(null);

   try {
     let response;
     switch (reportType) {
       case 'general':
         response = await axios.get(`${API_URL}/reports/general`);
         break;
       case 'flight-load':
         if (!dateRange.startDate || !dateRange.endDate) {
           throw new Error('Выберите период для отчета');
         }
         response = await axios.get(`${API_URL}/reports/flight-load`, {
           params: dateRange
         });
         break;
       case 'sales':
         if (!dateRange.startDate || !dateRange.endDate) {
           throw new Error('Выберите период для отчета');
         }
         response = await axios.get(`${API_URL}/reports/sales`, {
           params: dateRange
         });
         break;
       default:
         throw new Error('Неизвестный тип отчета');
     }
     setReport(response.data.data);
   } catch (err) {
     setError(err.response?.data?.message || err.message);
   } finally {
     setLoading(false);
   }
 };

 const formatPrice = (price) => {
   return new Intl.NumberFormat('ru-RU', {
     style: 'currency',
     currency: 'RUB',
     minimumFractionDigits: 0
   }).format(price);
 };

 const renderGeneralReport = () => {
   if (!report) return null;
   const { summary, mostExpensiveFlight, flightsForReplacement } = report;

   return (
     <div className="report-content">
       <h3>Общая статистика</h3>
       <div className="stats-grid">
         <div className="stat-card">
           <div className="stat-value">{summary.totalFlights}</div>
           <div className="stat-label">Всего рейсов</div>
         </div>
         <div className="stat-card">
           <div className="stat-value">{summary.totalDirectFlights}</div>
           <div className="stat-label">Прямых рейсов</div>
         </div>
         <div className="stat-card">
           <div className="stat-value">{formatPrice(summary.averagePrice)}</div>
           <div className="stat-label">Средняя цена билета</div>
         </div>
         <div className="stat-card">
           <div className="stat-value">{summary.overallLoadPercentage}%</div>
           <div className="stat-label">Общая загруженность</div>
         </div>
       </div>

       {mostExpensiveFlight && (
         <div>
           <h4>Самый дорогой рейс</h4>
           <div className="card">
             <div className="card-body">
               <p><strong>Номер рейса:</strong> {mostExpensiveFlight.flight_number}</p>
               <p><strong>Самолет:</strong> {mostExpensiveFlight.plane_name}</p>
               <p><strong>Маршрут:</strong> {mostExpensiveFlight.stops?.join(' → ')}</p>
               <p><strong>Цена:</strong> {formatPrice(mostExpensiveFlight.price)}</p>
             </div>
           </div>
         </div>
       )}

       {flightsForReplacement.length > 0 && (
         <div>
           <h4>Рейсы для замены самолета</h4>
           <div className="table-responsive">
             <table className="table">
               <thead>
                 <tr>
                   <th>Номер рейса</th>
                   <th>Самолет</th>
                   <th>Свободные места</th>
                   <th>% свободных мест</th>
                 </tr>
               </thead>
               <tbody>
                 {flightsForReplacement.map(flight => (
                   <tr key={flight.flight_number}>
                     <td>{flight.flight_number}</td>
                     <td>{flight.plane_name}</td>
                     <td>{flight.free_seats} из {flight.seats_count}</td>
                     <td>{flight.free_seats_percentage}%</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       )}
     </div>
   );
 };

 const renderFlightLoadReport = () => {
   if (!report) return null;

   return (
     <div className="report-content">
       <h3>Загруженность самолетов по рейсам</h3>
       <div className="table-responsive">
         <table className="table">
           <thead>
             <tr>
               <th>Номер рейса</th>
               <th>Самолет</th>
               <th>Время вылета</th>
               <th>Продано билетов</th>
               <th>Занято мест</th>
               <th>Загруженность</th>
             </tr>
           </thead>
           <tbody>
             {report.map(item => (
               <tr key={item.flight_number}>
                 <td>{item.flight_number}</td>
                 <td>{item.plane_name}</td>
                 <td>{item.departure_time}</td>
                 <td>{item.tickets_sold}</td>
                 <td>{item.total_occupied} из {item.seats_count}</td>
                 <td>
                   <span className={`badge ${
                     item.load_percentage > 80 ? 'badge-danger' :
                     item.load_percentage > 50 ? 'badge-warning' :
                     'badge-success'
                   }`}>
                   </span>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>
   );
 };

 const renderSalesReport = () => {
   if (!report) return null;
   const { summary, salesByCounter, salesByFlight } = report;

   return (
     <div className="report-content">
       <h3>Отчет по продажам</h3>
       <div className="stats-grid">
         <div className="stat-card">
           <div className="stat-value">{summary.totalTickets}</div>
           <div className="stat-label">Всего билетов продано</div>
         </div>
         <div className="stat-card">
           <div className="stat-value">{formatPrice(summary.totalRevenue)}</div>
           <div className="stat-label">Общая выручка</div>
         </div>
         <div className="stat-card">
           <div className="stat-value">{formatPrice(summary.averageTicketPrice)}</div>
           <div className="stat-label">Средняя цена билета</div>
         </div>
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
         <div>
           <h4>Продажи по кассам</h4>
           <div className="table-responsive">
             <table className="table">
               <thead>
                 <tr>
                   <th>Номер кассы</th>
                   <th>Билетов продано</th>
                   <th>Выручка</th>
                 </tr>
               </thead>
               <tbody>
                 {salesByCounter.map(item => (
                   <tr key={item.counter_number}>
                     <td>{item.counter_number}</td>
                     <td>{item.tickets_sold}</td>
                     <td>{formatPrice(item.total_revenue)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>

         <div>
           <h4>Продажи по рейсам</h4>
           <div className="table-responsive">
             <table className="table">
               <thead>
                 <tr>
                   <th>Номер рейса</th>
                   <th>Билетов продано</th>
                   <th>Выручка</th>
                 </tr>
               </thead>
               <tbody>
                 {salesByFlight.map(item => (
                   <tr key={item.flight_number}>
                     <td>{item.flight_number}</td>
                     <td>{item.tickets_sold}</td>
                     <td>{formatPrice(item.revenue)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       </div>
     </div>
   );
 };

 return (
   <div className="reports-page">
     <h1>Отчеты</h1>

     <div className="card">
       <div className="card-body">
         <div className="form-row">
           <div className="form-group">
             <label>Тип отчета</label>
             <select
               className="form-control"
               value={reportType}
               onChange={(e) => setReportType(e.target.value)}
             >
               <option value="general">Общий отчет</option>
               <option value="flight-load">Загруженность рейсов</option>
               <option value="sales">Отчет по продажам</option>
             </select>
           </div>

           {(reportType === 'flight-load' || reportType === 'sales') && (
             <>
               <div className="form-group">
                 <label>Дата начала</label>
                 <input
                   type="date"
                   className="form-control"
                   value={dateRange.startDate}
                   onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                 />
               </div>
               <div className="form-group">
                 <label>Дата окончания</label>
                 <input
                   type="date"
                   className="form-control"
                   value={dateRange.endDate}
                   onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                 />
               </div>
             </>
           )}
         </div>

         <button className="btn btn-primary" onClick={handleGenerateReport}>
           📊 Сформировать отчет
         </button>
       </div>
     </div>

     {loading && <Loader />}
     {error && <ErrorMessage message={error} />}

     {report && (
       <div className="card" style={{ marginTop: '20px' }}>
         <div className="card-body">
           {reportType === 'general' && renderGeneralReport()}
           {reportType === 'flight-load' && renderFlightLoadReport()}
           {reportType === 'sales' && renderSalesReport()}
         </div>
       </div>
     )}
   </div>
 );
};

export default Reports;