import React, { useState, useEffect } from "react";
import axios from "axios";
import "../assets/css/covid_chart.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const countryApi = "https://restcountries.com/v3.1/all";
const covidApiUrl = "https://disease.sh/v3/covid-19/historical/";
const numberOfDaysData = "?lastdays=1500";

function CovidDetail() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [countryPopulation, setCountryPopulation] = useState(0);
  const [startDate, setStartDate] = useState("2020-07-15");
  const [endDate, setEndDate] = useState("2021-07-24");
  const [chartData, setChartData] = useState([]);
  const completeUrl = covidApiUrl + selectedCountry + numberOfDaysData;
  const [totalCaseCountInMillion, setTotalCaseCountInMillion] = useState(0);
  const [totalDeathCountInMillion, setTotalDeathCountInMillion] = useState(0);
  const [totalRecoveryCountInMillion, setTotalRecoveryCountInMillion] =
    useState(0);
  const [totalCaseCount, setTotalCaseCount] = useState(0);
  const [totalDeathCount, setTotalDeathCount] = useState(0);
  const [totalRecoveryCount, setTotalRecoveryCount] = useState(0);

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(countryApi);
        const sortedCountryList = response.data.sort((a, b) => {
          return a.name.common.localeCompare(b.name.common);
        });
        setCountries(sortedCountryList);

        // getting index of selected country
        const countryIndex = sortedCountryList.findIndex(
          (country) => country.name.common === selectedCountry
        );

        // getting population of selected country
        const countryPop = response.data[countryIndex].population;
        setCountryPopulation(countryPop);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, [selectedCountry]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedCountry && startDate && endDate) {
        try {
          const response = await axios.get(completeUrl);
          const casesData = response.data.timeline.cases;
          const deathsData = response.data.timeline.deaths;
          const recoveryData = response.data.timeline.recovered;

          //   Converting date format of API resonse to default format
          const formattedCasesData = {};
          const formattedDeathsData = {};
          const formattedRecoveryData = {};
          Object.keys(casesData).forEach((date) => {
            formattedCasesData[formatDate(date)] = casesData[date];
            formattedDeathsData[formatDate(date)] = deathsData[date];
            formattedRecoveryData[formatDate(date)] = recoveryData[date];
          });

          setTotalCaseCount(
            ((casesData["3/9/23"] / countryPopulation) * 100).toFixed(4)
          );
          setTotalDeathCount(
            ((deathsData["3/9/23"] / casesData["3/9/23"]) * 100).toFixed(4)
          );
          setTotalRecoveryCount(
            ((recoveryData["8/4/21"] / casesData["3/9/23"]) * 100).toFixed(4)
          );

          setTotalCaseCountInMillion(convertToMillions(casesData["3/9/23"]));
          setTotalDeathCountInMillion(convertToMillions(deathsData["3/9/23"]));
          setTotalRecoveryCountInMillion(
            convertToMillions(recoveryData["8/4/21"])
          );

          // Get the keys of cases, deaths, and recovered
          const dates = Object.keys(formattedCasesData);

          // Filter dates based on the start and end date
          const filteredDates = dates.filter(
            (date) => date >= startDate && date <= endDate
          );
          // Populate chart data
          const data = filteredDates.map((date) => ({
            date,
            cases: formattedCasesData[date],
            deaths: formattedDeathsData[date],
            recovered: formattedRecoveryData[date],
          }));

          setChartData(data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchData();
  }, [selectedCountry, startDate, endDate, completeUrl, countryPopulation]);

  //   Function to convert big figures in millions
  function convertToMillions(number) {
    const roundedNumber = Math.round(number);
    const millionsValue = (roundedNumber / 1000000).toFixed(2);
    return millionsValue + "M";
  }

  // Function to handle changes in start date input
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  // Function to handle changes in end date input
  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const calculateTotalCounts = () => {
    let totalCases = 0;
    let totalDeaths = 0;
    let totalRecoveries = 0;
    chartData.forEach((data) => {
      totalCases = data.cases || 0;
      totalDeaths = data.deaths || 0;
      totalRecoveries = data.recovered || 0;
    });
    return [
      { name: "Total Cases", value: totalCases },
      { name: "Total Deaths", value: totalDeaths },
      { name: "Total Recoveries", value: totalRecoveries },
    ];
  };

  return (
    <div className="wrapper">
      <h1>COVID-19 and Population Dashboard</h1>
      <br />
      <div className="search_date_input">
        <form className="search_country">
          <label htmlFor="Select a Country">Select a Country</label>
          <br />
          <select
            id="country"
            value={selectedCountry}
            onChange={handleCountryChange}
          >
            {countries.map((country, index) => (
              <option key={index} value={country.name.common}>
                {country.name.common}
              </option>
            ))}
          </select>
        </form>

        <div className="date_range_picker">
          <div className="datepicker-label">Filter By Date Range</div>
          <div className="input-phone">
            <input
              type="date"
              className="startdate_picker"
              value={startDate}
              min={"2020-01-22"}
              onChange={handleStartDateChange}
              placeholder={startDate}
            />
            <input
              type="date"
              className="enddate_picker"
              value={endDate}
              max={"2023-03-09"}
              onChange={handleEndDateChange}
              placeholder={endDate}
            />
          </div>
        </div>
      </div>
      {selectedCountry && (
        <div className="stat_cards">
          <div className="totalCaseCard">
            <p className="total_cases">
              Total Cases <span>{totalCaseCountInMillion}</span>
            </p>
            <sub>{totalCaseCount}%</sub>
          </div>

          <div className="totalRecovCard">
            <p className="total_recoveries">
              Recoveries <span>{totalRecoveryCountInMillion}</span>
            </p>
            <sub>{totalRecoveryCount}%</sub>
          </div>

          <div className="totalDeathCard">
            <p className="total_deaths">
              Deaths <span>{totalDeathCountInMillion}</span>
            </p>
            <sub>{totalDeathCount}%</sub>
          </div>
        </div>
      )}
      <div className="chart_area">
        <ResponsiveContainer width={"70%"} height={400}>
          Line Chart
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="cases"
              stroke="#9ca8ff"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="deaths"
              stroke="#f44a53"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="recovered"
              stroke="#47d928"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <ResponsiveContainer width={"70%"} height={400}>
          &emsp; &emsp; &emsp; &emsp;Pie Chart (Donut)
          <PieChart>
            <Pie
              data={calculateTotalCounts()}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={140}
              fill="#8884d8"
              paddingAngle={4}
              label
            >
              {calculateTotalCounts().map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={pieColors[index % pieColors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
const pieColors = ["#0088fe", "#ff1100", "#1ea001"];
export default CovidDetail;
