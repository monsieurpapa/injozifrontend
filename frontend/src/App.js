import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [raceWinners, setRaceWinners] = useState([]);
  const [champions, setChampions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchRaceWinners(selectedYear);
      fetchChampions(selectedYear);
    }
  }, [selectedYear]);

  const fetchYears = async () => {
    try {
      const response = await fetch('http://ergast.com/api/f1/seasons.json?limit=100');
      const data = await response.json();
      const filteredYears = data.MRData.SeasonTable.Seasons.filter(year => {
        return parseInt(year.season) >= 2005 && parseInt(year.season) <= 2024;
      }).reverse();
      setYears(filteredYears);
    } catch (error) {
      console.error('Error fetching years:', error);
    }
  };

  const fetchChampions = async (year) => {
    try {
      const response = await fetch(`http://ergast.com/api/f1/${year}/driverStandings/1.json?limit=1000`);
      const data = await response.json();
      setChampions(data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || []);
    } catch (error) {
      console.error('Error fetching champions:', error);
    }
  };

  const fetchRaceWinners = async (year) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://ergast.com/api/f1/${year}.json`);
      const data = await response.json();
      const races = data?.MRData?.RaceTable?.Races || [];
      setRaceWinners(races);
    } catch (error) {
      console.error(`Error fetching winners for ${year}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const isWorldChampion = (driverId) => {
    return champions.some(champion => champion.Driver.driverId === driverId);
  };

  const handleYearClick = async (year) => {
    setSelectedYear(year);
  };

  return (
    <div className="App">
      <h1>F1 World Champions</h1>
      <div className="years-list">
        {years.map(year => (
          <div
            key={year.season}
            className={selectedYear === year.season ? 'year-item selected' : 'year-item'}
            onClick={() => handleYearClick(year.season)}
          >
            {year.season}
          </div>
        ))}
      </div>
      {selectedYear && (
        <div className="race-winners">
          <h2>Race Winners {selectedYear}</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : raceWinners.length > 0 ? (
            <ul>
              {raceWinners.map(race => (
                <li
                  key={race.round}
                  className={isWorldChampion(race.Results?.[0]?.Driver?.driverId) ? 'race-winner-champion' : 'race-winner'}
                >
                  {race.raceName} - {race.Results?.[0]?.Driver?.givenName} {race.Results?.[0]?.Driver?.familyName}
                </li>
              ))}
            </ul>
          ) : (
            <p>No race winners found for {selectedYear}.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
