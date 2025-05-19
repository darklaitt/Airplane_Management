import React, { useState } from 'react';

const FlightSearch = ({ onSearch, onClose }) => {
 const [searchType, setSearchType] = useState('nearest');
 const [destination, setDestination] = useState('');
 const [flightNumber, setFlightNumber] = useState('');

 const handleSearch = () => {
   const params = {};
   
   switch (searchType) {
     case 'nearest':
       if (destination) {
         params.destination = destination;
         onSearch('nearest', params);
       }
       break;
     case 'non-stop':
       onSearch('non-stop', {});
       break;
     case 'most-expensive':
       onSearch('most-expensive', {});
       break;
     case 'replacement':
       onSearch('replacement', {});
       break;
     case 'check-seats':
       if (flightNumber) {
         params.flightNumber = flightNumber;
         onSearch('check-seats', params);
       }
       break;
     default:
       break;
   }
 };

 return (
   <div className="flight-search">
     <div className="form-group">
       <label>Тип поиска</label>
       <select
         className="form-control"
         value={searchType}
         onChange={(e) => setSearchType(e.target.value)}
       >
         <option value="nearest">Ближайший рейс до пункта назначения</option>
         <option value="non-stop">Рейсы без промежуточных посадок</option>
         <option value="most-expensive">Самый дорогой рейс</option>
         <option value="replacement">Рейсы для замены самолета</option>
         <option value="check-seats">Проверить свободные места</option>
       </select>
     </div>

     {searchType === 'nearest' && (
       <div className="form-group">
         <label>Пункт назначения</label>
         <input
           type="text"
           className="form-control"
           value={destination}
           onChange={(e) => setDestination(e.target.value)}
           placeholder="Введите город"
         />
       </div>
     )}

     {searchType === 'check-seats' && (
       <div className="form-group">
         <label>Номер рейса</label>
         <input
           type="text"
           className="form-control"
           value={flightNumber}
           onChange={(e) => setFlightNumber(e.target.value)}
           placeholder="Например: SU1234"
         />
       </div>
     )}

     <div className="modal-footer">
       <button type="button" className="btn btn-secondary" onClick={onClose}>
         Закрыть
       </button>
       <button type="button" className="btn btn-primary" onClick={handleSearch}>
         Поиск
       </button>
     </div>
   </div>
 );
};

export default FlightSearch;