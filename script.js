document.addEventListener("DOMContentLoaded", function () {
    // Elements for the search section
    const searchButton = document.getElementById("search-button");
    const cryptoInput = document.getElementById("crypto-input");
    const cryptoResult = document.getElementById("crypto-result");

    // Elements for the prediction section
    const predictionButton = document.getElementById("prediction-button");
    const cryptoInputPrediction = document.getElementById("crypto-input-prediction");
    const cryptoPredictionResult = document.getElementById("crypto-prediction-result");

    // Function to create and display the price table
    function createPriceTable(priceData, targetElement) {
        const priceTableBody = targetElement.querySelector(".price-table-body");
        // Clear the table before adding new data
        priceTableBody.innerHTML = "";

        for (let i = 0; i < priceData.length; i++) {
            const entry = priceData[i];
            const date = new Date(entry[0]).toLocaleDateString();
            const price = entry[1];

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${date}</td>
                <td>$${price.toFixed(2)}</td>
            `;

            priceTableBody.appendChild(row);
        }
    }

    // Function to create and display the price chart
    function createPriceChart(priceData, targetElement) {
        const ctx = targetElement.querySelector(".price-line-chart").getContext("2d");

        const chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: priceData.map(entry => new Date(entry[0]).toLocaleDateString()), // Convert timestamp to date
                datasets: [{
                    label: "Price (USD)",
                    data: priceData.map(entry => entry[1]), // Extract price values
                    borderColor: "blue",
                    borderWidth: 2,
                    fill: false,
                }],
            },
            options: {
                responsive: false, // Disable chart responsiveness
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: "Date",
                        },
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: "Price (USD)",
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false, // Hide the legend
                    },
                },
                elements: {
                    point: {
                        radius: 0, // Set point radius to 0 to hide data points
                    },
                },
            },
        });
    }
    // Function to create and display the price table
function createPriceTable(priceData, targetElement) {
    const priceTableBody = targetElement.querySelector(".price-table-body");
    // Clear the table before adding new data
    priceTableBody.innerHTML = "";

    // Sort the price data in descending order by date
    priceData.sort((a, b) => b[0] - a[0]);

    for (let i = 0; i < priceData.length; i++) {
        const entry = priceData[i];
        const date = new Date(entry[0]).toLocaleDateString();
        const price = entry[1];

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${date}</td>
            <td>$${price.toFixed(2)}</td>
        `;

        // Apply Bootstrap table classes
        row.classList.add("table-hover"); 

        priceTableBody.appendChild(row);
    }
}






    

    // Function to handle cryptocurrency search
    function handleCryptoSearch() {
        const cryptoSymbol = cryptoInput.value.trim().toLowerCase();

        if (cryptoSymbol === "") {
            cryptoResult.innerHTML = "Please enter a cryptocurrency name or symbol.";
            return;
        }

        fetch(`https://api.coingecko.com/api/v3/coins/${cryptoSymbol}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.id) {
                    const name = data.name;
                    const symbol = data.symbol.toUpperCase();
                    const priceInUSD = data.market_data.current_price.usd;
                    const logoURL = data.image.small;

                    // Create the card structure with the chart and price table
                    cryptoResult.innerHTML = `
                        <div class="card">
                            <img src="${logoURL}" alt="${name} Logo" class="card-img-top crypto-logo-small">
                            <div class="card-body">
                                <h5 class="card-title">${name} (${symbol})</h5>
                                <p class="card-text">Price in USD: $${priceInUSD.toFixed(2)}</p>
                                <canvas class="price-line-chart" width="400" height="200"></canvas>
                                <h6 class="mt-3">Price Data Table</h6>
                                <table class="table table-bordered table-dark table-striped table-hover mt-2">
                                    <thead>
                                        <tr>
                                            <th>Day</th>
                                            <th>Price (USD)</th>
                                        </tr>
                                    </thead>
                                    <tbody class="price-table-body">
                                        <!-- Price data will be displayed here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;

                    // Fetch historical price data for the last 365 days from CoinGecko API
                    fetch(`https://api.coingecko.com/api/v3/coins/${cryptoSymbol}/market_chart?vs_currency=usd&days=365`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! Status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(chartData => {
                            const priceData = chartData.prices;
                            // Display price table
                            createPriceTable(priceData, cryptoResult);
                            // Create and display the price chart
                            createPriceChart(priceData, cryptoResult);
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                } else {
                    cryptoResult.innerHTML = `Cryptocurrency "${cryptoSymbol}" not found.`;
                    // Clear the price table and chart if the cryptocurrency is not found
                    cryptoResult.querySelector(".price-table-body").innerHTML = "";
                    cryptoResult.querySelector(".price-line-chart").remove();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                cryptoResult.innerHTML = 'An error occurred while fetching data.';
                // Clear the price table and chart in case of an error
                cryptoResult.querySelector(".price-table-body").innerHTML = "";
                cryptoResult.querySelector(".price-line-chart").remove();
            });
    }

    // Function to calculate the moving average (MA) of price data
    function calculateMovingAverage(priceData, period) {
        const prices = priceData.map(entry => entry[1]); // Extract price values
        if (prices.length < period) {
            return 0; // Not enough data for calculation
        }

        // Calculate the MA as the average of the last 'period' prices
        const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
        return sum / period;
    }

    // Function to predict cryptocurrency price based on average daily change
    async function predictCryptoPrice(cryptoSymbol) {
        const MA_SHORT_PERIOD = 7; // Short-term MA period (days)
        const MA_LONG_PERIOD = 365; // Long-term MA period (days)

        try {
            // Fetch historical price data for the last 365 days from CoinGecko API
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoSymbol}/market_chart?vs_currency=usd&days=365`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const chartData = await response.json();
            const priceData = chartData.prices;

            // Calculate the short-term MA
            const shortTermMA = calculateMovingAverage(priceData, MA_SHORT_PERIOD);

            // Calculate the long-term MA
            const longTermMA = calculateMovingAverage(priceData, MA_LONG_PERIOD);

            // Calculate the average daily price change
            const averageDailyChange = (shortTermMA - longTermMA) / MA_SHORT_PERIOD;

            // Project the next day's price based on the average daily change
            const lastPrice = priceData[priceData.length - 1][1];
            const nextDayPrice = lastPrice + averageDailyChange;

            // Make a prediction based on the projected next day's price
            if (nextDayPrice > lastPrice) {
                return `Prediction: The price of ${cryptoSymbol.toUpperCase()} is expected to go up to approximately $${nextDayPrice.toFixed(2)} tomorrow.`;
            } else if (nextDayPrice < lastPrice) {
                return `Prediction: The price of ${cryptoSymbol.toUpperCase()} is expected to go down to approximately $${nextDayPrice.toFixed(2)} tomorrow.`;
            } else {
                return `Prediction: The price of ${cryptoSymbol.toUpperCase()} is expected to remain approximately the same at $${nextDayPrice.toFixed(2)} tomorrow.`;
            }
        } catch (error) {
            throw error;
        }
    }

    // Function to handle cryptocurrency price prediction
    async function handleCryptoPrediction() {
        const cryptoSymbolPrediction = cryptoInputPrediction.value.trim().toLowerCase();

        if (cryptoSymbolPrediction === "") {
            cryptoPredictionResult.innerHTML = "Please enter a cryptocurrency name or symbol for prediction.";
            return;
        }

        try {
            // Implement your cryptocurrency price prediction logic here
            const predictionResult = await predictCryptoPrice(cryptoSymbolPrediction);

            // Display the prediction result
            cryptoPredictionResult.innerHTML = `
                <div class="alert alert-success" role="alert">
                    ${predictionResult}
                </div>
            `;
        } catch (error) {
            console.error('Error:', error);
            cryptoPredictionResult.innerHTML = `An error occurred while fetching data for prediction: ${error.message}`;
        }
    }

    // Event listeners for search and prediction buttons
    searchButton.addEventListener("click", handleCryptoSearch);
    predictionButton.addEventListener("click", handleCryptoPrediction);
}); 
