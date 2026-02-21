// Auto-calculate gross profit and margin when revenue or COGS changes
const currentYearInputs = ['revenue', 'cogs'];
const prevYearInputs = ['revenuePrev', 'cogsPrev'];

// Auto-calculate EBITDA, EBIT, Net Profit when costs change
const costInputs = ['personnelCosts', 'marketingCosts', 'otherOpex', 'allocatedCosts', 'depreciation', 'taxes', 'interests'];
const costInputsPrev = ['personnelCostsPrev', 'marketingCostsPrev', 'otherOpexPrev', 'allocatedCostsPrev', 'depreciationPrev', 'taxesPrev', 'interestsPrev'];

function getCurrencySymbol(currencyCode) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CNY': '¥',
        'INR': '₹',
        'AUD': '$',
        'CAD': '$',
        'CHF': 'Fr',
        'SEK': 'kr',
        'NOK': 'kr',
        'DKK': 'kr'
    };
    return symbols[currencyCode] || currencyCode;
}

function updateCurrencySymbols() {
    const currency = document.getElementById('currency').value;
    const symbol = getCurrencySymbol(currency);
    
    for (let i = 1; i <= 16; i++) {
        const element = document.getElementById(`currencySymbol${i}`);
        if (element) {
            element.textContent = symbol;
        }
    }
}

function updateGrossProfitFields(period) {
    let revenueSuffix = '';
    let cogsSuffix = '';
    let outputSuffix = '';
    
    if (period === 'prev') {
        revenueSuffix = 'Prev';
        cogsSuffix = 'Prev';
        outputSuffix = 'Prev';
    }
    
    const revenue = parseFloat(document.getElementById('revenue' + revenueSuffix).value) || 0;
    const cogs = Math.abs(parseFloat(document.getElementById('cogs' + cogsSuffix).value) || 0);
    
    const grossProfit = revenue - cogs;
    document.getElementById('grossProfitInput' + outputSuffix).textContent = formatCurrency(grossProfit);
    
    const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    document.getElementById('grossProfitMarginInput' + outputSuffix).textContent = formatPercentage(grossProfitMargin);
    
    // Calculate changes if we have both current and previous values
    if (period === 'current' || period === 'prev') {
        calculateChange('revenue');
        calculateChange('cogs');
        calculateChangeForCalculated('grossProfit');
        calculateChangeForCalculated('grossProfitMargin');
    }
}

function calculateChange(fieldName) {
    const current = parseFloat(document.getElementById(fieldName).value) || 0;
    const previous = parseFloat(document.getElementById(fieldName + 'Prev').value) || 0;
    
    const changeElement = document.getElementById(fieldName + 'Change');
    
    // Use absolute values for cost fields since they're stored as negative
    const costFields = ['cogs', 'personnelCosts', 'marketingCosts', 'otherOpex', 'allocatedCosts', 'depreciation', 'taxes', 'interests'];
    const isCostField = costFields.includes(fieldName);
    
    const currentAbs = Math.abs(current);
    const previousAbs = Math.abs(previous);
    
    if (previousAbs === 0) {
        changeElement.textContent = '-';
        changeElement.className = 'calculated-value';
    } else {
        const changePercent = ((currentAbs - previousAbs) / previousAbs) * 100;
        changeElement.textContent = formatPercentage(changePercent);
        
        if (changePercent > 0) {
            // Positive change: green for revenue, red for costs
            changeElement.className = isCostField ? 'calculated-value negative' : 'calculated-value positive';
        } else if (changePercent < 0) {
            // Negative change: red for revenue, green for costs
            changeElement.className = isCostField ? 'calculated-value positive' : 'calculated-value negative';
        } else {
            changeElement.className = 'calculated-value';
        }
    }
}

function calculateChangeForCalculated(fieldName) {
    const currentText = document.getElementById(fieldName + 'Input').textContent;
    const previousText = document.getElementById(fieldName + 'InputPrev').textContent;
    
    // Extract numeric values
    let current, previous;
    
    if (currentText.includes('%')) {
        current = parseFloat(currentText.replace('%', '')) || 0;
        previous = parseFloat(previousText.replace('%', '')) || 0;
    } else {
        current = parseFloat(currentText.replace(/[^0-9.-]/g, '')) || 0;
        previous = parseFloat(previousText.replace(/[^0-9.-]/g, '')) || 0;
    }
    
    const changeElement = document.getElementById(fieldName + 'Change');
    if (previous === 0) {
        changeElement.textContent = '-';
        changeElement.className = 'calculated-value';
    } else {
        const changePercent = ((current - previous) / previous) * 100;
        changeElement.textContent = formatPercentage(changePercent);
        
        // All calculated fields (profits, margins, EBITDA, EBIT) - increase is good (green)
        if (changePercent > 0) {
            changeElement.className = 'calculated-value positive';
        } else if (changePercent < 0) {
            changeElement.className = 'calculated-value negative';
        } else {
            changeElement.className = 'calculated-value';
        }
    }
}

function updateProfitFields(period) {
    let suffix = '';
    
    if (period === 'prev') {
        suffix = 'Prev';
    }
    
    const revenue = parseFloat(document.getElementById('revenue' + suffix).value) || 0;
    const cogs = Math.abs(parseFloat(document.getElementById('cogs' + suffix).value) || 0);
    const personnelCosts = Math.abs(parseFloat(document.getElementById('personnelCosts' + suffix).value) || 0);
    const marketingCosts = Math.abs(parseFloat(document.getElementById('marketingCosts' + suffix).value) || 0);
    const otherOpex = Math.abs(parseFloat(document.getElementById('otherOpex' + suffix).value) || 0);
    const allocatedCosts = Math.abs(parseFloat(document.getElementById('allocatedCosts' + suffix).value) || 0);
    const depreciation = Math.abs(parseFloat(document.getElementById('depreciation' + suffix).value) || 0);
    const taxes = Math.abs(parseFloat(document.getElementById('taxes' + suffix).value) || 0);
    const interests = Math.abs(parseFloat(document.getElementById('interests' + suffix).value) || 0);
    
    const grossProfit = revenue - cogs;
    
    // EBITDA = Gross Profit - Personnel - Marketing - Other OPEX - Allocated Costs
    const ebitda = grossProfit - personnelCosts - marketingCosts - otherOpex - allocatedCosts;
    document.getElementById('ebitdaInput' + suffix).textContent = formatCurrency(ebitda);
    
    // EBIT = EBITDA - Depreciation/Amortization
    const ebit = ebitda - depreciation;
    document.getElementById('ebitInput' + suffix).textContent = formatCurrency(ebit);
    
    // Net Profit = EBIT - Taxes - Interests
    const netProfit = ebit - taxes - interests;
    document.getElementById('netProfitInput' + suffix).textContent = formatCurrency(netProfit);
    
    // Net Profit Margin = Net Profit / Revenue
    const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    document.getElementById('netProfitMarginInput' + suffix).textContent = formatPercentage(netProfitMargin);
    
    // Calculate changes if we have both current and previous values
    if (period === 'current' || period === 'prev') {
        calculateChange('personnelCosts');
        calculateChange('marketingCosts');
        calculateChange('otherOpex');
        calculateChange('allocatedCosts');
        calculateChange('depreciation');
        calculateChange('taxes');
        calculateChange('interests');
        calculateChangeForCalculated('ebitda');
        calculateChangeForCalculated('ebit');
        calculateChangeForCalculated('netProfit');
        calculateChangeForCalculated('netProfitMargin');
    }
}

// Format input fields to show costs as negative
function formatCostInput(inputId) {
    const input = document.getElementById(inputId);
    if (input && input.value) {
        const value = Math.abs(parseFloat(input.value));
        if (value > 0) {
            input.value = -value;
        }
    }
}

// Add event listeners to format cost inputs as negative
const costInputIds = [
    'cogs', 'cogsPrev',
    'personnelCosts', 'personnelCostsPrev',
    'marketingCosts', 'marketingCostsPrev',
    'otherOpex', 'otherOpexPrev',
    'allocatedCosts', 'allocatedCostsPrev',
    'depreciation', 'depreciationPrev',
    'taxes', 'taxesPrev',
    'interests', 'interestsPrev'
];

costInputIds.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('blur', () => {
            if (input.value && parseFloat(input.value) > 0) {
                input.value = -Math.abs(parseFloat(input.value));
            }
        });
    }
});

function calculateMetrics() {
    const revenue = parseFloat(document.getElementById('revenue').value) || 0;
    const cogs = parseFloat(document.getElementById('cogs').value) || 0;
    const netIncome = parseFloat(document.getElementById('netIncome').value) || 0;
    const totalAssets = parseFloat(document.getElementById('totalAssets').value) || 0;
    const totalEquity = parseFloat(document.getElementById('totalEquity').value) || 0;
    
    const revenuePrev = parseFloat(document.getElementById('revenuePrev').value) || 0;
    const cogsPrev = parseFloat(document.getElementById('cogsPrev').value) || 0;
    const netIncomePrev = parseFloat(document.getElementById('netIncomePrev').value) || 0;
    const totalAssetsPrev = parseFloat(document.getElementById('totalAssetsPrev').value) || 0;
    const totalEquityPrev = parseFloat(document.getElementById('totalEquityPrev').value) || 0;
    
    const revenueAvg = parseFloat(document.getElementById('revenueAvg').value) || 0;
    const cogsAvg = parseFloat(document.getElementById('cogsAvg').value) || 0;
    const netIncomeAvg = parseFloat(document.getElementById('netIncomeAvg').value) || 0;
    const totalAssetsAvg = parseFloat(document.getElementById('totalAssetsAvg').value) || 0;
    const totalEquityAvg = parseFloat(document.getElementById('totalEquityAvg').value) || 0;
    
    // Current Year
    const grossProfit = revenue - cogs;
    document.getElementById('grossProfit').textContent = formatCurrency(grossProfit);
    
    const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    document.getElementById('grossProfitMargin').textContent = formatPercentage(grossProfitMargin);
    
    const roe = totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0;
    document.getElementById('roe').textContent = formatPercentage(roe);
    
    const roa = totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0;
    document.getElementById('roa').textContent = formatPercentage(roa);
    
    // Previous Year
    const grossProfitPrev = revenuePrev - cogsPrev;
    document.getElementById('grossProfitPrevYear').textContent = formatCurrency(grossProfitPrev);
    
    const grossProfitMarginPrev = revenuePrev > 0 ? (grossProfitPrev / revenuePrev) * 100 : 0;
    document.getElementById('grossProfitMarginPrevYear').textContent = formatPercentage(grossProfitMarginPrev);
    
    const roePrev = totalEquityPrev > 0 ? (netIncomePrev / totalEquityPrev) * 100 : 0;
    document.getElementById('roePrevYear').textContent = formatPercentage(roePrev);
    
    const roaPrev = totalAssetsPrev > 0 ? (netIncomePrev / totalAssetsPrev) * 100 : 0;
    document.getElementById('roaPrevYear').textContent = formatPercentage(roaPrev);
    
    // Industry Average
    const grossProfitAvg = revenueAvg - cogsAvg;
    document.getElementById('grossProfitAvgYear').textContent = formatCurrency(grossProfitAvg);
    
    const grossProfitMarginAvg = revenueAvg > 0 ? (grossProfitAvg / revenueAvg) * 100 : 0;
    document.getElementById('grossProfitMarginAvgYear').textContent = formatPercentage(grossProfitMarginAvg);
    
    const roeAvg = totalEquityAvg > 0 ? (netIncomeAvg / totalEquityAvg) * 100 : 0;
    document.getElementById('roeAvgYear').textContent = formatPercentage(roeAvg);
    
    const roaAvg = totalAssetsAvg > 0 ? (netIncomeAvg / totalAssetsAvg) * 100 : 0;
    document.getElementById('roaAvgYear').textContent = formatPercentage(roaAvg);
}

function formatCurrency(value) {
    const currency = document.getElementById('currency').value;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function formatPercentage(value) {
    return value.toFixed(2) + '%';
}

// Chart functionality
let comparisonChart1 = null;
let comparisonChart2 = null;

function initializeChart(canvasId, chartVariable) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Current Year', 'Previous Year'],
            datasets: [
                {
                    label: 'Revenue',
                    data: [0, 0],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(118, 75, 162, 1)'
                    ],
                    borderWidth: 2,
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: function(value) {
                            return formatCurrency(value);
                        },
                        font: {
                            weight: 'bold',
                            size: 10
                        }
                    }
                },
                {
                    label: 'Trend',
                    data: [0, 0],
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                    tension: 0,
                    datalabels: {
                        display: false
                    }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        filter: function(item) {
                            return item.text !== 'Trend';
                        },
                        font: {
                            size: 10
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Revenue Comparison',
                    font: {
                        size: 13,
                        weight: 'bold'
                    }
                },
                datalabels: {
                    color: '#333'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        },
                        font: {
                            size: 9
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 9
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function updateChart(chartInstance, selectedMetric) {
    const metricData = getMetricData(selectedMetric);
    
    if (chartInstance) {
        // Update bar chart data (Current Year first, then Previous Year)
        chartInstance.data.datasets[0].label = metricData.label;
        chartInstance.data.datasets[0].data = [metricData.current, metricData.previous];
        
        // Update trendline data (from current to previous)
        chartInstance.data.datasets[1].data = [metricData.current, metricData.previous];
        
        chartInstance.options.plugins.title.text = metricData.label + ' Comparison';
        
        // Update y-axis and data label formatting based on metric type
        const isPercentage = selectedMetric.includes('Margin') || selectedMetric.includes('margin');
        
        if (isPercentage) {
            chartInstance.options.scales.y.ticks.callback = function(value) {
                return value.toFixed(2) + '%';
            };
            chartInstance.data.datasets[0].datalabels.formatter = function(value) {
                return value.toFixed(2) + '%';
            };
        } else {
            chartInstance.options.scales.y.ticks.callback = function(value) {
                return formatCurrency(value);
            };
            chartInstance.data.datasets[0].datalabels.formatter = function(value) {
                return formatCurrency(value);
            };
        }
        
        chartInstance.update();
    }
}

function getMetricData(metric) {
    let current = 0, previous = 0, label = '';
    
    switch(metric) {
        case 'revenue':
            current = parseFloat(document.getElementById('revenue').value) || 0;
            previous = parseFloat(document.getElementById('revenuePrev').value) || 0;
            label = 'Revenue';
            break;
        case 'cogs':
            current = Math.abs(parseFloat(document.getElementById('cogs').value) || 0);
            previous = Math.abs(parseFloat(document.getElementById('cogsPrev').value) || 0);
            label = 'COGS';
            break;
        case 'grossProfit':
            current = parseFloat(document.getElementById('grossProfitInput').textContent.replace(/[^0-9.-]/g, '')) || 0;
            previous = parseFloat(document.getElementById('grossProfitInputPrev').textContent.replace(/[^0-9.-]/g, '')) || 0;
            label = 'Gross Profit';
            break;
        case 'grossProfitMargin':
            current = parseFloat(document.getElementById('grossProfitMarginInput').textContent.replace('%', '')) || 0;
            previous = parseFloat(document.getElementById('grossProfitMarginInputPrev').textContent.replace('%', '')) || 0;
            label = 'Gross Profit Margin';
            break;
        case 'personnelCosts':
            current = Math.abs(parseFloat(document.getElementById('personnelCosts').value) || 0);
            previous = Math.abs(parseFloat(document.getElementById('personnelCostsPrev').value) || 0);
            label = 'Personnel Costs';
            break;
        case 'marketingCosts':
            current = Math.abs(parseFloat(document.getElementById('marketingCosts').value) || 0);
            previous = Math.abs(parseFloat(document.getElementById('marketingCostsPrev').value) || 0);
            label = 'Marketing Costs';
            break;
        case 'otherOpex':
            current = Math.abs(parseFloat(document.getElementById('otherOpex').value) || 0);
            previous = Math.abs(parseFloat(document.getElementById('otherOpexPrev').value) || 0);
            label = 'Other OPEX';
            break;
        case 'allocatedCosts':
            current = Math.abs(parseFloat(document.getElementById('allocatedCosts').value) || 0);
            previous = Math.abs(parseFloat(document.getElementById('allocatedCostsPrev').value) || 0);
            label = 'Allocated Costs';
            break;
        case 'ebitda':
            current = parseFloat(document.getElementById('ebitdaInput').textContent.replace(/[^0-9.-]/g, '')) || 0;
            previous = parseFloat(document.getElementById('ebitdaInputPrev').textContent.replace(/[^0-9.-]/g, '')) || 0;
            label = 'EBITDA';
            break;
        case 'depreciation':
            current = Math.abs(parseFloat(document.getElementById('depreciation').value) || 0);
            previous = Math.abs(parseFloat(document.getElementById('depreciationPrev').value) || 0);
            label = 'Depreciation/Amortization';
            break;
        case 'ebit':
            current = parseFloat(document.getElementById('ebitInput').textContent.replace(/[^0-9.-]/g, '')) || 0;
            previous = parseFloat(document.getElementById('ebitInputPrev').textContent.replace(/[^0-9.-]/g, '')) || 0;
            label = 'EBIT';
            break;
        case 'taxes':
            current = Math.abs(parseFloat(document.getElementById('taxes').value) || 0);
            previous = Math.abs(parseFloat(document.getElementById('taxesPrev').value) || 0);
            label = 'Taxes';
            break;
        case 'interests':
            current = Math.abs(parseFloat(document.getElementById('interests').value) || 0);
            previous = Math.abs(parseFloat(document.getElementById('interestsPrev').value) || 0);
            label = 'Interests';
            break;
        case 'netProfit':
            current = parseFloat(document.getElementById('netProfitInput').textContent.replace(/[^0-9.-]/g, '')) || 0;
            previous = parseFloat(document.getElementById('netProfitInputPrev').textContent.replace(/[^0-9.-]/g, '')) || 0;
            label = 'Net Profit';
            break;
        case 'netProfitMargin':
            current = parseFloat(document.getElementById('netProfitMarginInput').textContent.replace('%', '')) || 0;
            previous = parseFloat(document.getElementById('netProfitMarginInputPrev').textContent.replace('%', '')) || 0;
            label = 'Net Profit Margin';
            break;
    }
    
    return { current, previous, label };
}

// Initialize chart when page loads and set up all event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Income Statement charts
    comparisonChart1 = initializeChart('comparisonChart1');
    comparisonChart2 = initializeChart('comparisonChart2');
    updateChart(comparisonChart1, 'grossProfit');
    updateChart(comparisonChart2, 'netProfit');
    
    // Initialize Balance Sheet charts
    comparisonChartBS1 = initializeChart('comparisonChartBS1');
    comparisonChartBS2 = initializeChart('comparisonChartBS2');
    updateChartBS(comparisonChartBS1, 'totalAssets');
    updateChartBS(comparisonChartBS2, 'totalEquity');
    
    // Initialize Cash Flow charts
    comparisonChartCF1 = initializeChart('comparisonChartCF1');
    comparisonChartCF2 = initializeChart('comparisonChartCF2');
    updateChartCF(comparisonChartCF1, 'netOperatingCF');
    updateChartCF(comparisonChartCF2, 'netChangeCash');
    
    // Initialize Profitability Ratios charts
    comparisonChartPR1 = initializeChart('comparisonChartPR1');
    comparisonChartPR2 = initializeChart('comparisonChartPR2');
    updateChartPR(comparisonChartPR1, 'grossMargin');
    updateChartPR(comparisonChartPR2, 'roe');
    
    // Initialize Planning charts
    stackedAreaChart = initializeStackedAreaChart();
    updateStackedAreaChart();
    
    // Initialize Forecasting chart
    forecastComparisonChart = initializeForecastChart();
    generateForecastTable();
    
    // Set up Income Statement input listeners
    currentYearInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            updateGrossProfitFields('current');
            updateProfitFields('current');
            updateChart(comparisonChart1, document.getElementById('metricSelect1').value);
            updateChart(comparisonChart2, document.getElementById('metricSelect2').value);
            updateKeyMetrics();
        });
    });

    prevYearInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            updateGrossProfitFields('prev');
            updateProfitFields('prev');
            updateChart(comparisonChart1, document.getElementById('metricSelect1').value);
            updateChart(comparisonChart2, document.getElementById('metricSelect2').value);
            updateKeyMetrics();
        });
    });

    costInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            updateProfitFields('current');
            updateChart(comparisonChart1, document.getElementById('metricSelect1').value);
            updateChart(comparisonChart2, document.getElementById('metricSelect2').value);
            updateKeyMetrics();
        });
    });

    costInputsPrev.forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            updateProfitFields('prev');
            updateChart(comparisonChart1, document.getElementById('metricSelect1').value);
            updateChart(comparisonChart2, document.getElementById('metricSelect2').value);
            updateKeyMetrics();
        });
    });

    document.getElementById('currency').addEventListener('change', () => {
        updateCurrencySymbols();
        updateGrossProfitFields('current');
        updateGrossProfitFields('prev');
        updateProfitFields('current');
        updateProfitFields('prev');
        updateChart(comparisonChart1, document.getElementById('metricSelect1').value);
        updateChart(comparisonChart2, document.getElementById('metricSelect2').value);
    });

    // Handle logo upload - sync across all tabs
    document.getElementById('logoUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const logoUrl = event.target.result;
                
                // Update all logo previews
                document.getElementById('logoPreview').innerHTML = `<img src="${logoUrl}" alt="Company Logo">`;
                document.getElementById('logoPreviewBS').innerHTML = `<img src="${logoUrl}" alt="Company Logo">`;
                document.getElementById('logoPreviewCF').innerHTML = `<img src="${logoUrl}" alt="Company Logo">`;
                document.getElementById('logoPreviewPR').innerHTML = `<img src="${logoUrl}" alt="Company Logo">`;
                document.getElementById('logoPreviewPlan').innerHTML = `<img src="${logoUrl}" alt="Company Logo">`;
                document.getElementById('logoPreviewForecast').innerHTML = `<img src="${logoUrl}" alt="Company Logo">`;
                
                // Show logo sections on all tabs
                document.querySelectorAll('.logo-upload-section').forEach(section => {
                    section.style.display = 'flex';
                });
                
                // Save to localStorage
                localStorage.setItem('companyLogo', logoUrl);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Load saved logo on page load
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
        document.getElementById('logoPreview').innerHTML = `<img src="${savedLogo}" alt="Company Logo">`;
        document.getElementById('logoPreviewBS').innerHTML = `<img src="${savedLogo}" alt="Company Logo">`;
        document.getElementById('logoPreviewCF').innerHTML = `<img src="${savedLogo}" alt="Company Logo">`;
        document.getElementById('logoPreviewPR').innerHTML = `<img src="${savedLogo}" alt="Company Logo">`;
        document.getElementById('logoPreviewPlan').innerHTML = `<img src="${savedLogo}" alt="Company Logo">`;
        document.getElementById('logoPreviewForecast').innerHTML = `<img src="${savedLogo}" alt="Company Logo">`;
        
        // Show logo sections
        document.querySelectorAll('.logo-upload-section').forEach(section => {
            section.style.display = 'flex';
        });
    } else {
        // Hide logo sections on tabs other than Income Statement if no logo
        document.getElementById('logoPreviewBS').parentElement.style.display = 'none';
        document.getElementById('logoPreviewCF').parentElement.style.display = 'none';
        document.getElementById('logoPreviewPR').parentElement.style.display = 'none';
        document.getElementById('logoPreviewPlan').parentElement.style.display = 'none';
        document.getElementById('logoPreviewForecast').parentElement.style.display = 'none';
    }

    // Handle PDF export
    document.getElementById('exportPdfBtn').addEventListener('click', function() {
        window.print();
    });
    
    // Update charts when metric selection changes
    document.getElementById('metricSelect1').addEventListener('change', function() {
        updateChart(comparisonChart1, this.value);
    });

    document.getElementById('metricSelect2').addEventListener('change', function() {
        updateChart(comparisonChart2, this.value);
    });
    
    // Balance Sheet event listeners
    document.getElementById('exportPdfBtnBS').addEventListener('click', function() {
        window.print();
    });
    
    document.getElementById('metricSelectBS1').addEventListener('change', function() {
        updateChartBS(comparisonChartBS1, this.value);
    });

    document.getElementById('metricSelectBS2').addEventListener('change', function() {
        updateChartBS(comparisonChartBS2, this.value);
    });
    
    // Initialize key metrics
    updateKeyMetrics();
    
    // Set up company info sync
    setupCompanyInfoSync();
    
    // Set up Profitability Ratios listeners
    setupProfitabilityRatiosListeners();
    
    // Set up Planning listeners
    setupPlanningListeners();
    
    // Set up Cash Flow listeners
    setupCashFlowListeners();
    
    // Set up Forecasting listeners
    setupForecastingListeners();
    
    // Set up cross-tab updates
    setupCrossTabUpdates();
    
    // Set up Cash Flow cross-tab updates
    setupCashFlowCrossTabUpdates();
    
    // Initialize Profitability Ratios
    updateProfitabilityRatios('current');
    updateProfitabilityRatios('prev');
    
    // Initialize Cash Flow calculations
    updateCashFlowCalculations('current');
    updateCashFlowCalculations('prev');
    
    // Initialize Planning calculations
    updatePlanningCalculations();
});

// Update key metrics
function updateKeyMetrics() {
    const revenueCurrent = parseFloat(document.getElementById('revenue').value) || 0;
    const revenuePrev = parseFloat(document.getElementById('revenuePrev').value) || 0;
    
    // Sales Growth
    let salesGrowth = 0;
    if (revenuePrev > 0) {
        salesGrowth = ((revenueCurrent - revenuePrev) / revenuePrev) * 100;
    }
    document.getElementById('salesGrowth').textContent = formatPercentage(salesGrowth);
    
    // Gross Profit Margin
    const grossProfitMarginText = document.getElementById('grossProfitMarginInput').textContent;
    document.getElementById('grossProfitMarginMetric').textContent = grossProfitMarginText;
    
    // Net Profit Margin
    const netProfitMarginText = document.getElementById('netProfitMarginInput').textContent;
    document.getElementById('netProfitMarginMetric').textContent = netProfitMarginText;
}


// Tab switching functionality
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        this.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Balance Sheet functionality
let comparisonChartBS1 = null;
let comparisonChartBS2 = null;

// Balance Sheet calculations
function updateBalanceSheetCalculations(period) {
    let suffix = period === 'prev' ? 'Prev' : '';
    
    const currentAssets = parseFloat(document.getElementById('currentAssets' + suffix).value) || 0;
    const fixedAssets = parseFloat(document.getElementById('fixedAssets' + suffix).value) || 0;
    const currentLiabilities = parseFloat(document.getElementById('currentLiabilities' + suffix).value) || 0;
    const longTermLiabilities = parseFloat(document.getElementById('longTermLiabilities' + suffix).value) || 0;
    
    // Total Assets
    const totalAssets = currentAssets + fixedAssets;
    document.getElementById('totalAssetsBS' + suffix).textContent = formatCurrencyBS(totalAssets);
    
    // Total Liabilities
    const totalLiabilities = currentLiabilities + longTermLiabilities;
    document.getElementById('totalLiabilitiesBS' + suffix).textContent = formatCurrencyBS(totalLiabilities);
    
    // Total Equity = Total Assets - Total Liabilities
    const totalEquity = totalAssets - totalLiabilities;
    document.getElementById('totalEquityBS' + suffix).textContent = formatCurrencyBS(totalEquity);
    
    // Calculate changes
    if (period === 'current' || period === 'prev') {
        calculateChangeBS('currentAssets');
        calculateChangeBS('fixedAssets');
        calculateChangeBS('currentLiabilities');
        calculateChangeBS('longTermLiabilities');
        calculateChangeForCalculatedBS('totalAssets');
        calculateChangeForCalculatedBS('totalLiabilities');
        calculateChangeForCalculatedBS('totalEquity');
    }
}

function formatCurrencyBS(value) {
    const currency = document.getElementById('currencyBS').value;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function calculateChangeBS(fieldName) {
    const current = parseFloat(document.getElementById(fieldName).value) || 0;
    const previous = parseFloat(document.getElementById(fieldName + 'Prev').value) || 0;
    
    const changeElement = document.getElementById(fieldName + 'Change');
    
    if (previous === 0) {
        changeElement.textContent = '-';
        changeElement.className = 'calculated-value';
    } else {
        const changePercent = ((current - previous) / previous) * 100;
        changeElement.textContent = formatPercentage(changePercent);
        
        if (changePercent > 0) {
            changeElement.className = 'calculated-value positive';
        } else if (changePercent < 0) {
            changeElement.className = 'calculated-value negative';
        } else {
            changeElement.className = 'calculated-value';
        }
    }
}

function calculateChangeForCalculatedBS(fieldName) {
    const currentText = document.getElementById(fieldName + 'BS').textContent;
    const previousText = document.getElementById(fieldName + 'BSPrev').textContent;
    
    const current = parseFloat(currentText.replace(/[^0-9.-]/g, '')) || 0;
    const previous = parseFloat(previousText.replace(/[^0-9.-]/g, '')) || 0;
    
    const changeElement = document.getElementById(fieldName + 'Change');
    if (previous === 0) {
        changeElement.textContent = '-';
        changeElement.className = 'calculated-value';
    } else {
        const changePercent = ((current - previous) / previous) * 100;
        changeElement.textContent = formatPercentage(changePercent);
        
        if (changePercent > 0) {
            changeElement.className = 'calculated-value positive';
        } else if (changePercent < 0) {
            changeElement.className = 'calculated-value negative';
        } else {
            changeElement.className = 'calculated-value';
        }
    }
}

// Balance Sheet input listeners
const bsInputs = ['currentAssets', 'fixedAssets', 'currentLiabilities', 'longTermLiabilities'];
const bsInputsPrev = ['currentAssetsPrev', 'fixedAssetsPrev', 'currentLiabilitiesPrev', 'longTermLiabilitiesPrev'];

bsInputs.forEach(id => {
    document.getElementById(id).addEventListener('input', () => updateBalanceSheetCalculations('current'));
});

bsInputsPrev.forEach(id => {
    document.getElementById(id).addEventListener('input', () => updateBalanceSheetCalculations('prev'));
});

// Balance Sheet currency change
document.getElementById('currencyBS').addEventListener('change', () => {
    updateCurrencySymbolsBS();
    updateBalanceSheetCalculations('current');
    updateBalanceSheetCalculations('prev');
});

function updateCurrencySymbolsBS() {
    const currency = document.getElementById('currencyBS').value;
    const symbol = getCurrencySymbol(currency);
    
    document.querySelectorAll('.currencySymbolBS').forEach(element => {
        element.textContent = symbol;
    });
}

// Balance Sheet Calculate button removed - calculations happen automatically

function updateChartBS(chartInstance, selectedMetric) {
    const metricData = getMetricDataBS(selectedMetric);
    
    if (chartInstance) {
        chartInstance.data.datasets[0].label = metricData.label;
        chartInstance.data.datasets[0].data = [metricData.current, metricData.previous];
        chartInstance.data.datasets[1].data = [metricData.current, metricData.previous];
        chartInstance.options.plugins.title.text = metricData.label + ' Comparison';
        
        chartInstance.options.scales.y.ticks.callback = function(value) {
            return formatCurrencyBS(value);
        };
        chartInstance.data.datasets[0].datalabels.formatter = function(value) {
            return formatCurrencyBS(value);
        };
        
        chartInstance.update();
    }
}

function getMetricDataBS(metric) {
    let current = 0, previous = 0, label = '';
    
    switch(metric) {
        case 'currentAssets':
            current = parseFloat(document.getElementById('currentAssets').value) || 0;
            previous = parseFloat(document.getElementById('currentAssetsPrev').value) || 0;
            label = 'Current Assets';
            break;
        case 'fixedAssets':
            current = parseFloat(document.getElementById('fixedAssets').value) || 0;
            previous = parseFloat(document.getElementById('fixedAssetsPrev').value) || 0;
            label = 'Fixed Assets';
            break;
        case 'totalAssets':
            current = parseFloat(document.getElementById('totalAssetsBS').textContent.replace(/[^0-9.-]/g, '')) || 0;
            previous = parseFloat(document.getElementById('totalAssetsBSPrev').textContent.replace(/[^0-9.-]/g, '')) || 0;
            label = 'Total Assets';
            break;
        case 'currentLiabilities':
            current = parseFloat(document.getElementById('currentLiabilities').value) || 0;
            previous = parseFloat(document.getElementById('currentLiabilitiesPrev').value) || 0;
            label = 'Current Liabilities';
            break;
        case 'longTermLiabilities':
            current = parseFloat(document.getElementById('longTermLiabilities').value) || 0;
            previous = parseFloat(document.getElementById('longTermLiabilitiesPrev').value) || 0;
            label = 'Long-term Liabilities';
            break;
        case 'totalLiabilities':
            current = parseFloat(document.getElementById('totalLiabilitiesBS').textContent.replace(/[^0-9.-]/g, '')) || 0;
            previous = parseFloat(document.getElementById('totalLiabilitiesBSPrev').textContent.replace(/[^0-9.-]/g, '')) || 0;
            label = 'Total Liabilities';
            break;
        case 'totalEquity':
            current = parseFloat(document.getElementById('totalEquityBS').textContent.replace(/[^0-9.-]/g, '')) || 0;
            previous = parseFloat(document.getElementById('totalEquityBSPrev').textContent.replace(/[^0-9.-]/g, '')) || 0;
            label = 'Total Equity';
            break;
    }
    
    return { current, previous, label };
}


// Profitability Ratios functionality
let comparisonChartPR1 = null;
let comparisonChartPR2 = null;

// Profitability Ratios calculations
function updateProfitabilityRatios(period) {
    let suffix = period === 'prev' ? 'Prev' : '';
    
    // Get data from Income Statement
    const revenue = parseFloat(document.getElementById('revenue' + suffix).value) || 0;
    const grossProfit = parseFloat(document.getElementById('grossProfitInput' + suffix).textContent.replace(/[^0-9.-]/g, '')) || 0;
    const ebit = parseFloat(document.getElementById('ebitInput' + suffix).textContent.replace(/[^0-9.-]/g, '')) || 0;
    const netProfit = parseFloat(document.getElementById('netProfitInput' + suffix).textContent.replace(/[^0-9.-]/g, '')) || 0;
    
    // Get data from Balance Sheet
    const totalAssets = parseFloat(document.getElementById('totalAssetsBS' + suffix).textContent.replace(/[^0-9.-]/g, '')) || 0;
    const totalEquity = parseFloat(document.getElementById('totalEquityBS' + suffix).textContent.replace(/[^0-9.-]/g, '')) || 0;
    
    // Get data from Profitability Ratios inputs
    const cashFlow = parseFloat(document.getElementById('cashFlowPR' + suffix).value) || 0;
    const investedCapital = parseFloat(document.getElementById('investedCapitalPR' + suffix).value) || 0;
    
    // Calculate pretax profit (EBIT - Interests)
    const interests = Math.abs(parseFloat(document.getElementById('interests' + suffix).value) || 0);
    const pretaxProfit = ebit - interests;
    
    // Calculate margins
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const operatingMargin = revenue > 0 ? (ebit / revenue) * 100 : 0;
    const pretaxMargin = revenue > 0 ? (pretaxProfit / revenue) * 100 : 0;
    const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const cashFlowMargin = revenue > 0 ? (cashFlow / revenue) * 100 : 0;
    
    // Calculate returns
    const roa = totalAssets > 0 ? (netProfit / totalAssets) * 100 : 0;
    const roe = totalEquity > 0 ? (netProfit / totalEquity) * 100 : 0;
    const roic = investedCapital > 0 ? (netProfit / investedCapital) * 100 : 0;
    
    // Update display
    document.getElementById('grossMarginPR' + suffix).textContent = formatPercentage(grossMargin);
    document.getElementById('operatingMarginPR' + suffix).textContent = formatPercentage(operatingMargin);
    document.getElementById('pretaxMarginPR' + suffix).textContent = formatPercentage(pretaxMargin);
    document.getElementById('netProfitMarginPR' + suffix).textContent = formatPercentage(netProfitMargin);
    document.getElementById('cashFlowMarginPR' + suffix).textContent = formatPercentage(cashFlowMargin);
    document.getElementById('roaPR' + suffix).textContent = formatPercentage(roa);
    document.getElementById('roePR' + suffix).textContent = formatPercentage(roe);
    document.getElementById('roicPR' + suffix).textContent = formatPercentage(roic);
    
    // Calculate changes
    if (period === 'current' || period === 'prev') {
        calculateChangeForCalculatedPR('grossMargin');
        calculateChangeForCalculatedPR('operatingMargin');
        calculateChangeForCalculatedPR('pretaxMargin');
        calculateChangeForCalculatedPR('netProfitMargin');
        calculateChangeForCalculatedPR('cashFlowMargin');
        calculateChangeForCalculatedPR('roa');
        calculateChangeForCalculatedPR('roe');
        calculateChangeForCalculatedPR('roic');
        calculateChangePR('cashFlow');
        calculateChangePR('investedCapital');
    }
}

function calculateChangePR(fieldName) {
    const current = parseFloat(document.getElementById(fieldName + 'PR').value) || 0;
    const previous = parseFloat(document.getElementById(fieldName + 'PRPrev').value) || 0;
    
    const changeElement = document.getElementById(fieldName + 'PRChange');
    
    if (previous === 0) {
        changeElement.textContent = '-';
        changeElement.className = 'calculated-value';
    } else {
        const changePercent = ((current - previous) / previous) * 100;
        changeElement.textContent = formatPercentage(changePercent);
        
        if (changePercent > 0) {
            changeElement.className = 'calculated-value positive';
        } else if (changePercent < 0) {
            changeElement.className = 'calculated-value negative';
        } else {
            changeElement.className = 'calculated-value';
        }
    }
}

function calculateChangeForCalculatedPR(fieldName) {
    const currentText = document.getElementById(fieldName + 'PR').textContent;
    const previousText = document.getElementById(fieldName + 'PRPrev').textContent;
    
    const current = parseFloat(currentText.replace('%', '')) || 0;
    const previous = parseFloat(previousText.replace('%', '')) || 0;
    
    const changeElement = document.getElementById(fieldName + 'PRChange');
    if (previous === 0) {
        changeElement.textContent = '-';
        changeElement.className = 'calculated-value';
    } else {
        const changePercent = ((current - previous) / previous) * 100;
        changeElement.textContent = formatPercentage(changePercent);
        
        // All ratios - increase is good (green)
        if (changePercent > 0) {
            changeElement.className = 'calculated-value positive';
        } else if (changePercent < 0) {
            changeElement.className = 'calculated-value negative';
        } else {
            changeElement.className = 'calculated-value';
        }
    }
}

// Profitability Ratios input listeners
const prInputs = ['cashFlowPR', 'investedCapitalPR'];
const prInputsPrev = ['cashFlowPRPrev', 'investedCapitalPRPrev'];

function setupProfitabilityRatiosListeners() {
    prInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                updateProfitabilityRatios('current');
                if (comparisonChartPR1) updateChartPR(comparisonChartPR1, document.getElementById('metricSelectPR1').value);
                if (comparisonChartPR2) updateChartPR(comparisonChartPR2, document.getElementById('metricSelectPR2').value);
            });
        }
    });

    prInputsPrev.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                updateProfitabilityRatios('prev');
                if (comparisonChartPR1) updateChartPR(comparisonChartPR1, document.getElementById('metricSelectPR1').value);
                if (comparisonChartPR2) updateChartPR(comparisonChartPR2, document.getElementById('metricSelectPR2').value);
            });
        }
    });

    // Currency change
    const currencyPR = document.getElementById('currencyPR');
    if (currencyPR) {
        currencyPR.addEventListener('change', () => {
            updateCurrencySymbolsPR();
            updateProfitabilityRatios('current');
            updateProfitabilityRatios('prev');
        });
    }

    // PDF export
    const exportPdfBtnPR = document.getElementById('exportPdfBtnPR');
    if (exportPdfBtnPR) {
        exportPdfBtnPR.addEventListener('click', function() {
            window.print();
        });
    }

    // Chart selectors
    const metricSelectPR1 = document.getElementById('metricSelectPR1');
    if (metricSelectPR1) {
        metricSelectPR1.addEventListener('change', function() {
            updateChartPR(comparisonChartPR1, this.value);
        });
    }

    const metricSelectPR2 = document.getElementById('metricSelectPR2');
    if (metricSelectPR2) {
        metricSelectPR2.addEventListener('change', function() {
            updateChartPR(comparisonChartPR2, this.value);
        });
    }
}

function updateCurrencySymbolsPR() {
    const currency = document.getElementById('currencyPR').value;
    const symbol = getCurrencySymbol(currency);
    
    document.querySelectorAll('.currencySymbolPR').forEach(element => {
        element.textContent = symbol;
    });
}

function formatCurrencyPR(value) {
    const currency = document.getElementById('currencyPR').value;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function updateChartPR(chartInstance, selectedMetric) {
    const metricData = getMetricDataPR(selectedMetric);
    
    if (chartInstance) {
        chartInstance.data.datasets[0].label = metricData.label;
        chartInstance.data.datasets[0].data = [metricData.current, metricData.previous];
        chartInstance.data.datasets[1].data = [metricData.current, metricData.previous];
        chartInstance.options.plugins.title.text = metricData.label + ' Comparison';
        
        // All profitability ratios are percentages
        chartInstance.options.scales.y.ticks.callback = function(value) {
            return value.toFixed(2) + '%';
        };
        chartInstance.data.datasets[0].datalabels.formatter = function(value) {
            return value.toFixed(2) + '%';
        };
        
        chartInstance.update();
    }
}

function getMetricDataPR(metric) {
    let current = 0, previous = 0, label = '';
    
    switch(metric) {
        case 'grossMargin':
            current = parseFloat(document.getElementById('grossMarginPR').textContent.replace('%', '')) || 0;
            previous = parseFloat(document.getElementById('grossMarginPRPrev').textContent.replace('%', '')) || 0;
            label = 'Gross Margin';
            break;
        case 'operatingMargin':
            current = parseFloat(document.getElementById('operatingMarginPR').textContent.replace('%', '')) || 0;
            previous = parseFloat(document.getElementById('operatingMarginPRPrev').textContent.replace('%', '')) || 0;
            label = 'Operating Margin';
            break;
        case 'pretaxMargin':
            current = parseFloat(document.getElementById('pretaxMarginPR').textContent.replace('%', '')) || 0;
            previous = parseFloat(document.getElementById('pretaxMarginPRPrev').textContent.replace('%', '')) || 0;
            label = 'Pretax Margin';
            break;
        case 'netProfitMargin':
            current = parseFloat(document.getElementById('netProfitMarginPR').textContent.replace('%', '')) || 0;
            previous = parseFloat(document.getElementById('netProfitMarginPRPrev').textContent.replace('%', '')) || 0;
            label = 'Net Profit Margin';
            break;
        case 'cashFlowMargin':
            current = parseFloat(document.getElementById('cashFlowMarginPR').textContent.replace('%', '')) || 0;
            previous = parseFloat(document.getElementById('cashFlowMarginPRPrev').textContent.replace('%', '')) || 0;
            label = 'Cash Flow Margin';
            break;
        case 'roa':
            current = parseFloat(document.getElementById('roaPR').textContent.replace('%', '')) || 0;
            previous = parseFloat(document.getElementById('roaPRPrev').textContent.replace('%', '')) || 0;
            label = 'Return on Assets (ROA)';
            break;
        case 'roe':
            current = parseFloat(document.getElementById('roePR').textContent.replace('%', '')) || 0;
            previous = parseFloat(document.getElementById('roePRPrev').textContent.replace('%', '')) || 0;
            label = 'Return on Equity (ROE)';
            break;
        case 'roic':
            current = parseFloat(document.getElementById('roicPR').textContent.replace('%', '')) || 0;
            previous = parseFloat(document.getElementById('roicPRPrev').textContent.replace('%', '')) || 0;
            label = 'Return on Invested Capital (ROIC)';
            break;
    }
    
    return { current, previous, label };
}

// Add listener to update profitability ratios when Income Statement or Balance Sheet data changes
function setupCrossTabUpdates() {
    // When Income Statement changes, update Profitability Ratios
    currentYearInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                setTimeout(() => {
                    updateProfitabilityRatios('current');
                    if (comparisonChartPR1) updateChartPR(comparisonChartPR1, document.getElementById('metricSelectPR1').value);
                    if (comparisonChartPR2) updateChartPR(comparisonChartPR2, document.getElementById('metricSelectPR2').value);
                }, 100);
            });
        }
    });

    prevYearInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                setTimeout(() => {
                    updateProfitabilityRatios('prev');
                    if (comparisonChartPR1) updateChartPR(comparisonChartPR1, document.getElementById('metricSelectPR1').value);
                    if (comparisonChartPR2) updateChartPR(comparisonChartPR2, document.getElementById('metricSelectPR2').value);
                }, 100);
            });
        }
    });

    costInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                setTimeout(() => {
                    updateProfitabilityRatios('current');
                    if (comparisonChartPR1) updateChartPR(comparisonChartPR1, document.getElementById('metricSelectPR1').value);
                    if (comparisonChartPR2) updateChartPR(comparisonChartPR2, document.getElementById('metricSelectPR2').value);
                }, 100);
            });
        }
    });

    costInputsPrev.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                setTimeout(() => {
                    updateProfitabilityRatios('prev');
                    if (comparisonChartPR1) updateChartPR(comparisonChartPR1, document.getElementById('metricSelectPR1').value);
                    if (comparisonChartPR2) updateChartPR(comparisonChartPR2, document.getElementById('metricSelectPR2').value);
                }, 100);
            });
        }
    });

    // When Balance Sheet changes, update Profitability Ratios
    bsInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                setTimeout(() => {
                    updateProfitabilityRatios('current');
                    if (comparisonChartPR1) updateChartPR(comparisonChartPR1, document.getElementById('metricSelectPR1').value);
                    if (comparisonChartPR2) updateChartPR(comparisonChartPR2, document.getElementById('metricSelectPR2').value);
                }, 100);
            });
        }
    });

    bsInputsPrev.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                setTimeout(() => {
                    updateProfitabilityRatios('prev');
                    if (comparisonChartPR1) updateChartPR(comparisonChartPR1, document.getElementById('metricSelectPR1').value);
                    if (comparisonChartPR2) updateChartPR(comparisonChartPR2, document.getElementById('metricSelectPR2').value);
                }, 100);
            });
        }
    });
}


// Helper Sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
    const helperToggle = document.getElementById('helperToggle');
    const helperSidebar = document.getElementById('helperSidebar');
    const helperClose = document.getElementById('helperClose');
    const helperNotepad = document.getElementById('helperNotepad');
    const clearNotepad = document.getElementById('clearNotepad');
    const copyNotepad = document.getElementById('copyNotepad');
    
    // Load saved notepad content
    const savedNotes = localStorage.getItem('financialNotes');
    if (savedNotes) {
        helperNotepad.value = savedNotes;
    }
    
    // Toggle sidebar
    helperToggle.addEventListener('click', function() {
        helperSidebar.classList.toggle('active');
    });
    
    // Close sidebar
    helperClose.addEventListener('click', function() {
        helperSidebar.classList.remove('active');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (!helperSidebar.contains(event.target) && 
            !helperToggle.contains(event.target) && 
            helperSidebar.classList.contains('active')) {
            helperSidebar.classList.remove('active');
        }
    });
    
    // Save notepad content to localStorage
    helperNotepad.addEventListener('input', function() {
        localStorage.setItem('financialNotes', helperNotepad.value);
    });
    
    // Clear notepad
    clearNotepad.addEventListener('click', function() {
        if (confirm('Clear all notes?')) {
            helperNotepad.value = '';
            localStorage.removeItem('financialNotes');
        }
    });
    
    // Copy notepad content
    copyNotepad.addEventListener('click', function() {
        helperNotepad.select();
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = copyNotepad.textContent;
        copyNotepad.textContent = 'Copied!';
        setTimeout(() => {
            copyNotepad.textContent = originalText;
        }, 1500);
    });
});


// Planning functionality
let stackedAreaChart = null;

const planningMetrics = ['revenue', 'cogs', 'opex', 'capex', 'ftes'];
const planningYears = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'];

function calculateCAGRAndProjection(metric) {
    const year1Input = document.getElementById(metric + 'Y1');
    const year5Input = document.getElementById(metric + 'Y5');
    const cagrDisplay = document.getElementById(metric + 'CAGR');
    
    if (!year1Input || !year5Input || !cagrDisplay) return;
    
    const year1Value = parseFloat(year1Input.value) || 0;
    const year5Value = parseFloat(year5Input.value) || 0;
    
    // Calculate CAGR if both Year 1 and Year 5 have values
    if (year1Value !== 0 && year5Value !== 0 && year1Value > 0) {
        // CAGR formula: ((Ending Value / Beginning Value)^(1/number of years) - 1) * 100
        const cagr = (Math.pow(year5Value / year1Value, 1/4) - 1) * 100;
        cagrDisplay.textContent = cagr.toFixed(2) + '%';
        
        // Now project Years 2, 3, 4 based on the calculated CAGR
        for (let i = 2; i <= 4; i++) {
            const yearInput = document.getElementById(metric + 'Y' + i);
            if (yearInput) {
                const projectedValue = year1Value * Math.pow(1 + (cagr / 100), i - 1);
                yearInput.value = projectedValue.toFixed(2);
            }
        }
    } else {
        cagrDisplay.textContent = '0.00%';
    }
}

function updatePlanningCalculations() {
    planningYears.forEach(year => {
        const revenue = parseFloat(document.getElementById('revenue' + year).value) || 0;
        const cogs = parseFloat(document.getElementById('cogs' + year).value) || 0;
        const opex = parseFloat(document.getElementById('opex' + year).value) || 0;
        
        // EBITDA = Revenue - COGS - OPEX
        const ebitda = revenue - cogs - opex;
        
        const ebitdaElement = document.getElementById('ebitda' + year);
        ebitdaElement.textContent = formatCurrencyPlan(ebitda);
    });
    
    // Update charts if they exist
    if (stackedAreaChart) {
        updateStackedAreaChart();
    }
}

function formatCurrencyPlan(value) {
    const currency = document.getElementById('currencyPlan').value;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function updateCurrencySymbolsPlan() {
    const currency = document.getElementById('currencyPlan').value;
    const symbol = getCurrencySymbol(currency);
    
    document.querySelectorAll('.currencySymbolPlan').forEach(element => {
        element.textContent = symbol;
    });
}

function setupPlanningListeners() {
    // Input listeners for all planning fields
    planningMetrics.forEach(metric => {
        planningYears.forEach(year => {
            const element = document.getElementById(metric + year);
            if (element) {
                element.addEventListener('input', updatePlanningCalculations);
            }
        });
        
        // Year 1 and Year 5 input listeners to trigger CAGR calculation
        const year1Input = document.getElementById(metric + 'Y1');
        if (year1Input) {
            year1Input.addEventListener('input', function() {
                calculateCAGRAndProjection(metric);
                updatePlanningCalculations();
            });
        }
        
        const year5Input = document.getElementById(metric + 'Y5');
        if (year5Input) {
            year5Input.addEventListener('input', function() {
                calculateCAGRAndProjection(metric);
                updatePlanningCalculations();
            });
        }
    });
    
    // Currency change
    const currencyPlan = document.getElementById('currencyPlan');
    if (currencyPlan) {
        currencyPlan.addEventListener('change', () => {
            updateCurrencySymbolsPlan();
            updatePlanningCalculations();
        });
    }
    
    // Logo upload
    const logoUploadPlan = document.getElementById('logoUploadPlan');
    if (logoUploadPlan) {
        logoUploadPlan.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const logoPreview = document.getElementById('logoPreviewPlan');
                    logoPreview.innerHTML = `<img src="${event.target.result}" alt="Company Logo">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // PDF export
    const exportPdfBtnPlan = document.getElementById('exportPdfBtnPlan');
    if (exportPdfBtnPlan) {
        exportPdfBtnPlan.addEventListener('click', function() {
            window.print();
        });
    }
}

function initializeStackedAreaChart() {
    const ctx = document.getElementById('stackedAreaChart').getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                {
                    label: 'EBITDA',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'OPEX',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(251, 146, 60, 0.6)',
                    borderColor: 'rgba(251, 146, 60, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'COGS',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                title: {
                    display: true,
                    text: 'Revenue Breakdown: COGS + OPEX + EBITDA',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += formatCurrencyPlan(context.parsed.y);
                            return label;
                        },
                        footer: function(tooltipItems) {
                            let total = 0;
                            tooltipItems.forEach(function(tooltipItem) {
                                total += tooltipItem.parsed.y;
                            });
                            return 'Total Revenue: ' + formatCurrencyPlan(total);
                        }
                    }
                },
                datalabels: {
                    display: false
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrencyPlan(value);
                        },
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function updateStackedAreaChart() {
    if (!stackedAreaChart) return;
    
    const yearLabels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
    
    // Get data for all 5 years
    const cogsData = [];
    const opexData = [];
    const ebitdaData = [];
    
    planningYears.forEach(year => {
        const cogs = Math.abs(parseFloat(document.getElementById('cogs' + year).value) || 0);
        const opex = Math.abs(parseFloat(document.getElementById('opex' + year).value) || 0);
        const ebitdaText = document.getElementById('ebitda' + year).textContent;
        const ebitda = Math.abs(parseFloat(ebitdaText.replace(/[^0-9.-]/g, '')) || 0);
        
        cogsData.push(cogs);
        opexData.push(opex);
        ebitdaData.push(ebitda);
    });
    
    // Update chart data - order matters for stacking (bottom to top)
    stackedAreaChart.data.labels = yearLabels;
    stackedAreaChart.data.datasets[0].data = ebitdaData;  // Top layer (green)
    stackedAreaChart.data.datasets[1].data = opexData;    // Middle layer (orange)
    stackedAreaChart.data.datasets[2].data = cogsData;    // Bottom layer (red)
    
    stackedAreaChart.update();
}

function setupPlanningListeners() {
    // Input listeners for all planning fields
    planningMetrics.forEach(metric => {
        planningYears.forEach(year => {
            const element = document.getElementById(metric + year);
            if (element) {
                element.addEventListener('input', updatePlanningCalculations);
            }
        });
        
        // Year 1 and Year 5 input listeners to trigger CAGR calculation
        const year1Input = document.getElementById(metric + 'Y1');
        if (year1Input) {
            year1Input.addEventListener('input', function() {
                calculateCAGRAndProjection(metric);
                updatePlanningCalculations();
            });
        }
        
        const year5Input = document.getElementById(metric + 'Y5');
        if (year5Input) {
            year5Input.addEventListener('input', function() {
                calculateCAGRAndProjection(metric);
                updatePlanningCalculations();
            });
        }
    });
    
    // Currency change
    const currencyPlan = document.getElementById('currencyPlan');
    if (currencyPlan) {
        currencyPlan.addEventListener('change', () => {
            updateCurrencySymbolsPlan();
            updatePlanningCalculations();
        });
    }
    
    // Logo upload
    const logoUploadPlan = document.getElementById('logoUploadPlan');
    if (logoUploadPlan) {
        logoUploadPlan.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const logoPreview = document.getElementById('logoPreviewPlan');
                    logoPreview.innerHTML = `<img src="${event.target.result}" alt="Company Logo">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // PDF export
    const exportPdfBtnPlan = document.getElementById('exportPdfBtnPlan');
    if (exportPdfBtnPlan) {
        exportPdfBtnPlan.addEventListener('click', function() {
            window.print();
        });
    }
    
    // Chart selectors
    const metricSelectPlan1 = document.getElementById('metricSelectPlan1');
    if (metricSelectPlan1) {
        metricSelectPlan1.addEventListener('change', function() {
            updateChartPlan(comparisonChartPlan1, this.value);
        });
    }
    
    const metricSelectPlan2 = document.getElementById('metricSelectPlan2');
    if (metricSelectPlan2) {
        metricSelectPlan2.addEventListener('change', function() {
            updateChartPlan(comparisonChartPlan2, this.value);
        });
    }
}



// Forecasting functionality
let forecastComparisonChart = null;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateForecastTable() {
    const startBalance = parseFloat(document.getElementById('startBalance').value) || 0;
    const endBalance = parseFloat(document.getElementById('endBalance').value) || 0;
    
    const tableBody = document.getElementById('forecastTableBody');
    tableBody.innerHTML = '';
    
    // Calculate monthly plan values (linear spread)
    const monthlyIncrease = (endBalance - startBalance) / 11; // 11 intervals for 12 months
    
    months.forEach((month, index) => {
        const planValue = startBalance + (monthlyIncrease * index);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${month}</td>
            <td class="plan-cell" id="plan${index}">${formatCurrencyForecast(planValue)}</td>
            <td><input type="number" class="actuals-input" id="actual${index}" data-month="${index}" placeholder="0" step="0.01"></td>
            <td class="variance-cell" id="variance${index}">$0</td>
            <td class="variance-percent-cell" id="variancePercent${index}">0.00%</td>
        `;
        tableBody.appendChild(row);
        
        // Add event listener to actuals input
        const actualInput = row.querySelector(`#actual${index}`);
        actualInput.addEventListener('input', calculateVariances);
    });
    
    calculateVariances();
    updateForecastChart();
}

function calculateVariances() {
    let totalPlan = 0;
    let totalActuals = 0;
    
    months.forEach((month, index) => {
        const planText = document.getElementById(`plan${index}`).textContent;
        const planValue = parseFloat(planText.replace(/[^0-9.-]/g, '')) || 0;
        const actualValue = parseFloat(document.getElementById(`actual${index}`).value) || 0;
        
        totalPlan += planValue;
        totalActuals += actualValue;
        
        const variance = actualValue - planValue;
        const variancePercent = planValue !== 0 ? (variance / planValue) * 100 : 0;
        
        // Update variance cells
        const varianceCell = document.getElementById(`variance${index}`);
        const variancePercentCell = document.getElementById(`variancePercent${index}`);
        
        varianceCell.textContent = formatCurrencyForecast(variance);
        variancePercentCell.textContent = formatPercentage(variancePercent);
        
        // Color coding
        if (variance > 0) {
            varianceCell.className = 'variance-cell variance-positive';
            variancePercentCell.className = 'variance-percent-cell variance-positive';
        } else if (variance < 0) {
            varianceCell.className = 'variance-cell variance-negative';
            variancePercentCell.className = 'variance-percent-cell variance-negative';
        } else {
            varianceCell.className = 'variance-cell';
            variancePercentCell.className = 'variance-percent-cell';
        }
    });
    
    // Update totals
    const totalVariance = totalActuals - totalPlan;
    const totalVariancePercent = totalPlan !== 0 ? (totalVariance / totalPlan) * 100 : 0;
    
    document.getElementById('totalPlan').textContent = formatCurrencyForecast(totalPlan);
    document.getElementById('totalActuals').textContent = formatCurrencyForecast(totalActuals);
    document.getElementById('totalVariance').textContent = formatCurrencyForecast(totalVariance);
    document.getElementById('totalVariancePercent').textContent = formatPercentage(totalVariancePercent);
    
    // Update chart
    updateForecastChart();
}

function formatCurrencyForecast(value) {
    const currency = document.getElementById('currencyForecast').value;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function updateCurrencySymbolsForecast() {
    const currency = document.getElementById('currencyForecast').value;
    const symbol = getCurrencySymbol(currency);
    
    document.querySelectorAll('.currencySymbolForecast').forEach(element => {
        element.textContent = symbol;
    });
}

function initializeForecastChart() {
    const ctx = document.getElementById('forecastComparisonChart').getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Plan',
                    data: [],
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    fill: false,
                    tension: 0.3
                },
                {
                    label: 'Actuals',
                    data: [],
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                    fill: false,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                title: {
                    display: true,
                    text: 'Monthly Plan vs Actuals',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += formatCurrencyForecast(context.parsed.y);
                            return label;
                        }
                    }
                },
                datalabels: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrencyForecast(value);
                        },
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function updateForecastChart() {
    if (!forecastComparisonChart) return;
    
    const planData = [];
    const actualsData = [];
    
    months.forEach((month, index) => {
        const planText = document.getElementById(`plan${index}`)?.textContent || '$0';
        const planValue = parseFloat(planText.replace(/[^0-9.-]/g, '')) || 0;
        const actualValue = parseFloat(document.getElementById(`actual${index}`)?.value) || 0;
        
        planData.push(planValue);
        actualsData.push(actualValue);
    });
    
    forecastComparisonChart.data.datasets[0].data = planData;
    forecastComparisonChart.data.datasets[1].data = actualsData;
    
    // Update chart title with selected metric
    const metricSelect = document.getElementById('metricSelect');
    const metricName = metricSelect.options[metricSelect.selectedIndex].text;
    forecastComparisonChart.options.plugins.title.text = `${metricName}: Monthly Plan vs Actuals`;
    
    forecastComparisonChart.update();
}

function setupForecastingListeners() {
    // Start and End balance listeners
    document.getElementById('startBalance').addEventListener('input', generateForecastTable);
    document.getElementById('endBalance').addEventListener('input', generateForecastTable);
    
    // Metric selector
    document.getElementById('metricSelect').addEventListener('change', updateForecastChart);
    
    // Currency change
    document.getElementById('currencyForecast').addEventListener('change', () => {
        updateCurrencySymbolsForecast();
        generateForecastTable();
    });
    
    // PDF export
    document.getElementById('exportPdfBtnForecast').addEventListener('click', function() {
        window.print();
    });
}


// Cash Flow functionality
let comparisonChartCF1 = null;
let comparisonChartCF2 = null;

// Cash Flow calculations
function updateCashFlowCalculations(period) {
    let suffix = period === 'prev' ? 'Prev' : '';
    
    // Get Net Profit from Income Statement
    const netProfit = parseFloat(document.getElementById('netProfitInput' + suffix).textContent.replace(/[^0-9.-]/g, '')) || 0;
    document.getElementById('netProfitCF' + suffix).textContent = formatCurrencyCF(netProfit);
    
    // Operating Activities
    const depreciation = parseFloat(document.getElementById('depreciationCF' + suffix).value) || 0;
    const workingCapitalChanges = parseFloat(document.getElementById('workingCapitalChanges' + suffix).value) || 0;
    const otherOperating = parseFloat(document.getElementById('otherOperatingCF' + suffix).value) || 0;
    
    const netOperatingCF = netProfit + depreciation + workingCapitalChanges + otherOperating;
    document.getElementById('netOperatingCF' + suffix).textContent = formatCurrencyCF(netOperatingCF);
    
    // Investing Activities
    const capex = parseFloat(document.getElementById('capexCF' + suffix).value) || 0;
    const investments = parseFloat(document.getElementById('investmentsCF' + suffix).value) || 0;
    const otherInvesting = parseFloat(document.getElementById('otherInvestingCF' + suffix).value) || 0;
    
    const netInvestingCF = capex + investments + otherInvesting;
    document.getElementById('netInvestingCF' + suffix).textContent = formatCurrencyCF(netInvestingCF);
    
    // Financing Activities
    const debt = parseFloat(document.getElementById('debtCF' + suffix).value) || 0;
    const equity = parseFloat(document.getElementById('equityCF' + suffix).value) || 0;
    const dividends = parseFloat(document.getElementById('dividendsCF' + suffix).value) || 0;
    const otherFinancing = parseFloat(document.getElementById('otherFinancingCF' + suffix).value) || 0;
    
    const netFinancingCF = debt + equity + dividends + otherFinancing;
    document.getElementById('netFinancingCF' + suffix).textContent = formatCurrencyCF(netFinancingCF);
    
    // Net Change in Cash
    const netChangeCash = netOperatingCF + netInvestingCF + netFinancingCF;
    document.getElementById('netChangeCash' + suffix).textContent = formatCurrencyCF(netChangeCash);
    
    // Ending Cash Balance
    const beginningCash = parseFloat(document.getElementById('beginningCash' + suffix).value) || 0;
    const endingCash = beginningCash + netChangeCash;
    document.getElementById('endingCash' + suffix).textContent = formatCurrencyCF(endingCash);
    
    // Calculate changes
    if (period === 'current' || period === 'prev') {
        calculateChangeCF('depreciationCF');
        calculateChangeCF('workingCapitalChanges');
        calculateChangeCF('otherOperatingCF');
        calculateChangeCF('capexCF');
        calculateChangeCF('investmentsCF');
        calculateChangeCF('otherInvestingCF');
        calculateChangeCF('debtCF');
        calculateChangeCF('equityCF');
        calculateChangeCF('dividendsCF');
        calculateChangeCF('otherFinancingCF');
        calculateChangeCF('beginningCash');
        calculateChangeForCalculatedCF('netProfitCF');
        calculateChangeForCalculatedCF('netOperatingCF');
        calculateChangeForCalculatedCF('netInvestingCF');
        calculateChangeForCalculatedCF('netFinancingCF');
        calculateChangeForCalculatedCF('netChangeCash');
        calculateChangeForCalculatedCF('endingCash');
    }
}

function formatCurrencyCF(value) {
    const currency = document.getElementById('currencyCF').value;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function calculateChangeCF(fieldName) {
    const current = parseFloat(document.getElementById(fieldName).value) || 0;
    const previous = parseFloat(document.getElementById(fieldName + 'Prev').value) || 0;
    
    const changeElement = document.getElementById(fieldName + 'Change');
    
    if (previous === 0) {
        changeElement.textContent = '-';
        changeElement.className = 'calculated-value';
    } else {
        const changePercent = ((current - previous) / previous) * 100;
        changeElement.textContent = formatPercentage(changePercent);
        
        if (changePercent > 0) {
            changeElement.className = 'calculated-value positive';
        } else if (changePercent < 0) {
            changeElement.className = 'calculated-value negative';
        } else {
            changeElement.className = 'calculated-value';
        }
    }
}

function calculateChangeForCalculatedCF(fieldName) {
    const currentText = document.getElementById(fieldName).textContent;
    const previousText = document.getElementById(fieldName + 'Prev').textContent;
    
    const current = parseFloat(currentText.replace(/[^0-9.-]/g, '')) || 0;
    const previous = parseFloat(previousText.replace(/[^0-9.-]/g, '')) || 0;
    
    const changeElement = document.getElementById(fieldName + 'Change');
    if (previous === 0) {
        changeElement.textContent = '-';
        changeElement.className = 'calculated-value';
    } else {
        const changePercent = ((current - previous) / previous) * 100;
        changeElement.textContent = formatPercentage(changePercent);
        
        if (changePercent > 0) {
            changeElement.className = 'calculated-value positive';
        } else if (changePercent < 0) {
            changeElement.className = 'calculated-value negative';
        } else {
            changeElement.className = 'calculated-value';
        }
    }
}

function updateCurrencySymbolsCF() {
    const currency = document.getElementById('currencyCF').value;
    const symbol = getCurrencySymbol(currency);
    
    document.querySelectorAll('.currencySymbolCF').forEach(element => {
        element.textContent = symbol;
    });
}

function updateChartCF(chartInstance, selectedMetric) {
    const metricData = getMetricDataCF(selectedMetric);
    
    if (chartInstance) {
        chartInstance.data.datasets[0].label = metricData.label;
        chartInstance.data.datasets[0].data = [metricData.current, metricData.previous];
        chartInstance.data.datasets[1].data = [metricData.current, metricData.previous];
        chartInstance.options.plugins.title.text = metricData.label + ' Comparison';
        
        chartInstance.options.scales.y.ticks.callback = function(value) {
            return formatCurrencyCF(value);
        };
        chartInstance.data.datasets[0].datalabels.formatter = function(value) {
            return formatCurrencyCF(value);
        };
        
        chartInstance.update();
    }
}

function getMetricDataCF(metric) {
    let current = 0, previous = 0, label = '';
    
    switch(metric) {
        case 'netOperatingCF':
            current = parseFloat(document.getElementById('netOperatingCF').textContent.replace(/[^0-9.-]/g, '')) || 0;
            previous = parseFloat(document.getElementById('netOperatingCFPrev').textContent.replace(/[^0-9.-]/g, '')) || 0;
            label = 'Net Operating Cash Flow';
            break;
        case 'netInvestingCF':
            current = parseFloat(document.getElementById('netInvestingCF').textContent.replace(/[^0-9.-]/g, '')) || 0;
            previous = parseFloat(document.getElementById('netInvestingCFPrev').textContent.replace(/[^0-9.-]/g, '')) || 0;
            label = 'Net Investing Cash Flow';
            break;
        case 'netFinancingCF':
            current = parseFloat(document.getElementById('netFinancingCF').textContent.replace(/[^0-9.-]/g, '')) || 0;
            previous = parseFloat(document.getElementById('netFinancingCFPrev').textContent.replace(/[^0-9.-]/g, '')) || 0;
            label = 'Net Financing Cash Flow';
            break;
        case 'netChangeCash':
            current = parseFloat(document.getElementById('netChangeCash').textContent.replace(/[^0-9.-]/g, '')) || 0;
            previous = parseFloat(document.getElementById('netChangeCashPrev').textContent.replace(/[^0-9.-]/g, '')) || 0;
            label = 'Net Change in Cash';
            break;
        case 'endingCash':
            current = parseFloat(document.getElementById('endingCash').textContent.replace(/[^0-9.-]/g, '')) || 0;
            previous = parseFloat(document.getElementById('endingCashPrev').textContent.replace(/[^0-9.-]/g, '')) || 0;
            label = 'Ending Cash Balance';
            break;
    }
    
    return { current, previous, label };
}

function setupCashFlowListeners() {
    // Cash Flow input listeners
    const cfInputs = ['depreciationCF', 'workingCapitalChanges', 'otherOperatingCF', 'capexCF', 'investmentsCF', 'otherInvestingCF', 'debtCF', 'equityCF', 'dividendsCF', 'otherFinancingCF', 'beginningCash'];
    const cfInputsPrev = ['depreciationCFPrev', 'workingCapitalChangesPrev', 'otherOperatingCFPrev', 'capexCFPrev', 'investmentsCFPrev', 'otherInvestingCFPrev', 'debtCFPrev', 'equityCFPrev', 'dividendsCFPrev', 'otherFinancingCFPrev', 'beginningCashPrev'];
    
    cfInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                updateCashFlowCalculations('current');
                if (comparisonChartCF1) updateChartCF(comparisonChartCF1, document.getElementById('metricSelectCF1').value);
                if (comparisonChartCF2) updateChartCF(comparisonChartCF2, document.getElementById('metricSelectCF2').value);
            });
        }
    });
    
    cfInputsPrev.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                updateCashFlowCalculations('prev');
                if (comparisonChartCF1) updateChartCF(comparisonChartCF1, document.getElementById('metricSelectCF1').value);
                if (comparisonChartCF2) updateChartCF(comparisonChartCF2, document.getElementById('metricSelectCF2').value);
            });
        }
    });
    
    // Currency change
    const currencyCF = document.getElementById('currencyCF');
    if (currencyCF) {
        currencyCF.addEventListener('change', () => {
            updateCurrencySymbolsCF();
            updateCashFlowCalculations('current');
            updateCashFlowCalculations('prev');
        });
    }
    
    // PDF export
    const exportPdfBtnCF = document.getElementById('exportPdfBtnCF');
    if (exportPdfBtnCF) {
        exportPdfBtnCF.addEventListener('click', function() {
            window.print();
        });
    }
    
    // Chart selectors
    const metricSelectCF1 = document.getElementById('metricSelectCF1');
    if (metricSelectCF1) {
        metricSelectCF1.addEventListener('change', function() {
            updateChartCF(comparisonChartCF1, this.value);
        });
    }
    
    const metricSelectCF2 = document.getElementById('metricSelectCF2');
    if (metricSelectCF2) {
        metricSelectCF2.addEventListener('change', function() {
            updateChartCF(comparisonChartCF2, this.value);
        });
    }
}

// Update Cash Flow when Income Statement changes
function setupCashFlowCrossTabUpdates() {
    currentYearInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                setTimeout(() => {
                    updateCashFlowCalculations('current');
                    if (comparisonChartCF1) updateChartCF(comparisonChartCF1, document.getElementById('metricSelectCF1').value);
                    if (comparisonChartCF2) updateChartCF(comparisonChartCF2, document.getElementById('metricSelectCF2').value);
                }, 100);
            });
        }
    });
    
    prevYearInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                setTimeout(() => {
                    updateCashFlowCalculations('prev');
                    if (comparisonChartCF1) updateChartCF(comparisonChartCF1, document.getElementById('metricSelectCF1').value);
                    if (comparisonChartCF2) updateChartCF(comparisonChartCF2, document.getElementById('metricSelectCF2').value);
                }, 100);
            });
        }
    });
    
    costInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                setTimeout(() => {
                    updateCashFlowCalculations('current');
                    if (comparisonChartCF1) updateChartCF(comparisonChartCF1, document.getElementById('metricSelectCF1').value);
                    if (comparisonChartCF2) updateChartCF(comparisonChartCF2, document.getElementById('metricSelectCF2').value);
                }, 100);
            });
        }
    });
    
    costInputsPrev.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                setTimeout(() => {
                    updateCashFlowCalculations('prev');
                    if (comparisonChartCF1) updateChartCF(comparisonChartCF1, document.getElementById('metricSelectCF1').value);
                    if (comparisonChartCF2) updateChartCF(comparisonChartCF2, document.getElementById('metricSelectCF2').value);
                }, 100);
            });
        }
    });
}


// Company Info Sync functionality
function setupCompanyInfoSync() {
    // Load saved company info
    const savedCompanyName = localStorage.getItem('companyName');
    const savedOrgNumber = localStorage.getItem('orgNumber');
    
    if (savedCompanyName) {
        document.getElementById('companyName').value = savedCompanyName;
        syncCompanyName(savedCompanyName);
    }
    
    if (savedOrgNumber) {
        document.getElementById('orgNumber').value = savedOrgNumber;
        syncOrgNumber(savedOrgNumber);
    }
    
    // Company Name sync
    document.getElementById('companyName').addEventListener('input', function() {
        const companyName = this.value;
        syncCompanyName(companyName);
        localStorage.setItem('companyName', companyName);
    });
    
    // Organization Number sync
    document.getElementById('orgNumber').addEventListener('input', function() {
        const orgNumber = this.value;
        syncOrgNumber(orgNumber);
        localStorage.setItem('orgNumber', orgNumber);
    });
}

function syncCompanyName(name) {
    // Update all tabs
    const companyNameFields = [
        'companyNameBS',
        'companyNameCF',
        'companyNamePR',
        'companyNamePlan',
        'companyNameForecast'
    ];
    
    companyNameFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = name;
        }
    });
}

function syncOrgNumber(number) {
    // Update all tabs
    const orgNumberFields = [
        'orgNumberBS',
        'orgNumberCF',
        'orgNumberPR',
        'orgNumberPlan',
        'orgNumberForecast'
    ];
    
    orgNumberFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = number;
        }
    });
}


// Excel Export functionality
function exportToExcel(tabName) {
    const workbook = XLSX.utils.book_new();
    const companyName = document.getElementById('companyName').value || 'Company';
    const orgNumber = document.getElementById('orgNumber').value || '';
    
    switch(tabName) {
        case 'income-statement':
            exportIncomeStatementToExcel(workbook, companyName, orgNumber);
            break;
        case 'balance-sheet':
            exportBalanceSheetToExcel(workbook, companyName, orgNumber);
            break;
        case 'cash-flow':
            exportCashFlowToExcel(workbook, companyName, orgNumber);
            break;
        case 'profitability-ratios':
            exportProfitabilityRatiosToExcel(workbook, companyName, orgNumber);
            break;
        case 'planning':
            exportPlanningToExcel(workbook, companyName, orgNumber);
            break;
        case 'forecasting':
            exportForecastingToExcel(workbook, companyName, orgNumber);
            break;
    }
    
    const fileName = `${companyName}_${tabName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

function exportIncomeStatementToExcel(workbook, companyName, orgNumber) {
    const currency = document.getElementById('currency').value;
    const data = [
        ['Income Statement'],
        ['Company Name:', companyName],
        ['Organization Number:', orgNumber],
        ['Currency:', currency],
        [],
        ['Metric', 'Current Year', 'Previous Year', 'Change'],
        ['Revenue', document.getElementById('revenue').value || 0, document.getElementById('revenuePrev').value || 0, document.getElementById('revenueChange').textContent],
        ['COGS', document.getElementById('cogs').value || 0, document.getElementById('cogsPrev').value || 0, document.getElementById('cogsChange').textContent],
        ['Gross Profit', document.getElementById('grossProfitInput').textContent, document.getElementById('grossProfitInputPrev').textContent, document.getElementById('grossProfitChange').textContent],
        ['Gross Profit Margin', document.getElementById('grossProfitMarginInput').textContent, document.getElementById('grossProfitMarginInputPrev').textContent, document.getElementById('grossProfitMarginChange').textContent],
        ['Personnel Costs', document.getElementById('personnelCosts').value || 0, document.getElementById('personnelCostsPrev').value || 0, document.getElementById('personnelCostsChange').textContent],
        ['Marketing Costs', document.getElementById('marketingCosts').value || 0, document.getElementById('marketingCostsPrev').value || 0, document.getElementById('marketingCostsChange').textContent],
        ['Other OPEX', document.getElementById('otherOpex').value || 0, document.getElementById('otherOpexPrev').value || 0, document.getElementById('otherOpexChange').textContent],
        ['Allocated Costs', document.getElementById('allocatedCosts').value || 0, document.getElementById('allocatedCostsPrev').value || 0, document.getElementById('allocatedCostsChange').textContent],
        ['EBITDA', document.getElementById('ebitdaInput').textContent, document.getElementById('ebitdaInputPrev').textContent, document.getElementById('ebitdaChange').textContent],
        ['Depreciation/Amortization', document.getElementById('depreciation').value || 0, document.getElementById('depreciationPrev').value || 0, document.getElementById('depreciationChange').textContent],
        ['EBIT', document.getElementById('ebitInput').textContent, document.getElementById('ebitInputPrev').textContent, document.getElementById('ebitChange').textContent],
        ['Taxes', document.getElementById('taxes').value || 0, document.getElementById('taxesPrev').value || 0, document.getElementById('taxesChange').textContent],
        ['Interests', document.getElementById('interests').value || 0, document.getElementById('interestsPrev').value || 0, document.getElementById('interestsChange').textContent],
        ['Net Profit', document.getElementById('netProfitInput').textContent, document.getElementById('netProfitInputPrev').textContent, document.getElementById('netProfitChange').textContent],
        ['Net Profit Margin', document.getElementById('netProfitMarginInput').textContent, document.getElementById('netProfitMarginInputPrev').textContent, document.getElementById('netProfitMarginChange').textContent],
        [],
        ['Key Metrics'],
        ['Sales Growth', document.getElementById('salesGrowth').textContent],
        ['Gross Profit Margin', document.getElementById('grossProfitMarginMetric').textContent],
        ['Net Profit Margin', document.getElementById('netProfitMarginMetric').textContent]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Income Statement');
}

function exportBalanceSheetToExcel(workbook, companyName, orgNumber) {
    const currency = document.getElementById('currencyBS').value;
    const data = [
        ['Balance Sheet'],
        ['Company Name:', companyName],
        ['Organization Number:', orgNumber],
        ['Currency:', currency],
        [],
        ['Metric', 'Current Year', 'Previous Year', 'Change'],
        ['ASSETS'],
        ['Current Assets', document.getElementById('currentAssets').value || 0, document.getElementById('currentAssetsPrev').value || 0, document.getElementById('currentAssetsChange').textContent],
        ['Fixed Assets', document.getElementById('fixedAssets').value || 0, document.getElementById('fixedAssetsPrev').value || 0, document.getElementById('fixedAssetsChange').textContent],
        ['Total Assets', document.getElementById('totalAssetsBS').textContent, document.getElementById('totalAssetsBSPrev').textContent, document.getElementById('totalAssetsChange').textContent],
        [],
        ['LIABILITIES'],
        ['Current Liabilities', document.getElementById('currentLiabilities').value || 0, document.getElementById('currentLiabilitiesPrev').value || 0, document.getElementById('currentLiabilitiesChange').textContent],
        ['Long-term Liabilities', document.getElementById('longTermLiabilities').value || 0, document.getElementById('longTermLiabilitiesPrev').value || 0, document.getElementById('longTermLiabilitiesChange').textContent],
        ['Total Liabilities', document.getElementById('totalLiabilitiesBS').textContent, document.getElementById('totalLiabilitiesBSPrev').textContent, document.getElementById('totalLiabilitiesChange').textContent],
        [],
        ['EQUITY'],
        ['Total Equity', document.getElementById('totalEquityBS').textContent, document.getElementById('totalEquityBSPrev').textContent, document.getElementById('totalEquityChange').textContent]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Balance Sheet');
}

function exportCashFlowToExcel(workbook, companyName, orgNumber) {
    const currency = document.getElementById('currencyCF').value;
    const data = [
        ['Cash Flow Statement'],
        ['Company Name:', companyName],
        ['Organization Number:', orgNumber],
        ['Currency:', currency],
        [],
        ['Metric', 'Current Year', 'Previous Year', 'Change'],
        ['OPERATING ACTIVITIES'],
        ['Net Profit', document.getElementById('netProfitCF').textContent, document.getElementById('netProfitCFPrev').textContent, document.getElementById('netProfitCFChange').textContent],
        ['Depreciation & Amortization', document.getElementById('depreciationCF').value || 0, document.getElementById('depreciationCFPrev').value || 0, document.getElementById('depreciationCFChange').textContent],
        ['Changes in Working Capital', document.getElementById('workingCapitalChanges').value || 0, document.getElementById('workingCapitalChangesPrev').value || 0, document.getElementById('workingCapitalChangesChange').textContent],
        ['Other Operating Activities', document.getElementById('otherOperatingCF').value || 0, document.getElementById('otherOperatingCFPrev').value || 0, document.getElementById('otherOperatingCFChange').textContent],
        ['Net Cash from Operating Activities', document.getElementById('netOperatingCF').textContent, document.getElementById('netOperatingCFPrev').textContent, document.getElementById('netOperatingCFChange').textContent],
        [],
        ['INVESTING ACTIVITIES'],
        ['Capital Expenditures', document.getElementById('capexCF').value || 0, document.getElementById('capexCFPrev').value || 0, document.getElementById('capexCFChange').textContent],
        ['Investments & Acquisitions', document.getElementById('investmentsCF').value || 0, document.getElementById('investmentsCFPrev').value || 0, document.getElementById('investmentsCFChange').textContent],
        ['Other Investing Activities', document.getElementById('otherInvestingCF').value || 0, document.getElementById('otherInvestingCFPrev').value || 0, document.getElementById('otherInvestingCFChange').textContent],
        ['Net Cash from Investing Activities', document.getElementById('netInvestingCF').textContent, document.getElementById('netInvestingCFPrev').textContent, document.getElementById('netInvestingCFChange').textContent],
        [],
        ['FINANCING ACTIVITIES'],
        ['Debt Issued/Repaid', document.getElementById('debtCF').value || 0, document.getElementById('debtCFPrev').value || 0, document.getElementById('debtCFChange').textContent],
        ['Equity Issued/Repurchased', document.getElementById('equityCF').value || 0, document.getElementById('equityCFPrev').value || 0, document.getElementById('equityCFChange').textContent],
        ['Dividends Paid', document.getElementById('dividendsCF').value || 0, document.getElementById('dividendsCFPrev').value || 0, document.getElementById('dividendsCFChange').textContent],
        ['Other Financing Activities', document.getElementById('otherFinancingCF').value || 0, document.getElementById('otherFinancingCFPrev').value || 0, document.getElementById('otherFinancingCFChange').textContent],
        ['Net Cash from Financing Activities', document.getElementById('netFinancingCF').textContent, document.getElementById('netFinancingCFPrev').textContent, document.getElementById('netFinancingCFChange').textContent],
        [],
        ['SUMMARY'],
        ['Net Change in Cash', document.getElementById('netChangeCash').textContent, document.getElementById('netChangeCashPrev').textContent, document.getElementById('netChangeCashChange').textContent],
        ['Beginning Cash Balance', document.getElementById('beginningCash').value || 0, document.getElementById('beginningCashPrev').value || 0, document.getElementById('beginningCashChange').textContent],
        ['Ending Cash Balance', document.getElementById('endingCash').textContent, document.getElementById('endingCashPrev').textContent, document.getElementById('endingCashChange').textContent]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cash Flow');
}

function exportProfitabilityRatiosToExcel(workbook, companyName, orgNumber) {
    const currency = document.getElementById('currencyPR').value;
    const data = [
        ['Profitability Ratios'],
        ['Company Name:', companyName],
        ['Organization Number:', orgNumber],
        ['Currency:', currency],
        [],
        ['Metric', 'Current Year', 'Previous Year', 'Change'],
        ['Gross Margin', document.getElementById('grossMarginPR').textContent, document.getElementById('grossMarginPRPrev').textContent, document.getElementById('grossMarginPRChange').textContent],
        ['Operating Margin', document.getElementById('operatingMarginPR').textContent, document.getElementById('operatingMarginPRPrev').textContent, document.getElementById('operatingMarginPRChange').textContent],
        ['Pretax Margin', document.getElementById('pretaxMarginPR').textContent, document.getElementById('pretaxMarginPRPrev').textContent, document.getElementById('pretaxMarginPRChange').textContent],
        ['Net Profit Margin', document.getElementById('netProfitMarginPR').textContent, document.getElementById('netProfitMarginPRPrev').textContent, document.getElementById('netProfitMarginPRChange').textContent],
        ['Operating Cash Flow', document.getElementById('cashFlowPR').value || 0, document.getElementById('cashFlowPRPrev').value || 0, document.getElementById('cashFlowPRChange').textContent],
        ['Cash Flow Margin', document.getElementById('cashFlowMarginPR').textContent, document.getElementById('cashFlowMarginPRPrev').textContent, document.getElementById('cashFlowMarginPRChange').textContent],
        ['Return on Assets (ROA)', document.getElementById('roaPR').textContent, document.getElementById('roaPRPrev').textContent, document.getElementById('roaPRChange').textContent],
        ['Return on Equity (ROE)', document.getElementById('roePR').textContent, document.getElementById('roePRPrev').textContent, document.getElementById('roePRChange').textContent],
        ['Invested Capital', document.getElementById('investedCapitalPR').value || 0, document.getElementById('investedCapitalPRPrev').value || 0, document.getElementById('investedCapitalPRChange').textContent],
        ['Return on Invested Capital (ROIC)', document.getElementById('roicPR').textContent, document.getElementById('roicPRPrev').textContent, document.getElementById('roicPRChange').textContent]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Profitability Ratios');
}

function exportPlanningToExcel(workbook, companyName, orgNumber) {
    const currency = document.getElementById('currencyPlan').value;
    const data = [
        ['5-Year Planning'],
        ['Company Name:', companyName],
        ['Organization Number:', orgNumber],
        ['Currency:', currency],
        [],
        ['Metric', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'CAGR %'],
        ['Revenues', 
            document.getElementById('revenueY1').value || 0,
            document.getElementById('revenueY2').value || 0,
            document.getElementById('revenueY3').value || 0,
            document.getElementById('revenueY4').value || 0,
            document.getElementById('revenueY5').value || 0,
            document.getElementById('revenueCAGR').textContent
        ],
        ['COGS', 
            document.getElementById('cogsY1').value || 0,
            document.getElementById('cogsY2').value || 0,
            document.getElementById('cogsY3').value || 0,
            document.getElementById('cogsY4').value || 0,
            document.getElementById('cogsY5').value || 0,
            document.getElementById('cogsCAGR').textContent
        ],
        ['OPEX', 
            document.getElementById('opexY1').value || 0,
            document.getElementById('opexY2').value || 0,
            document.getElementById('opexY3').value || 0,
            document.getElementById('opexY4').value || 0,
            document.getElementById('opexY5').value || 0,
            document.getElementById('opexCAGR').textContent
        ],
        ['EBITDA', 
            document.getElementById('ebitdaY1').textContent,
            document.getElementById('ebitdaY2').textContent,
            document.getElementById('ebitdaY3').textContent,
            document.getElementById('ebitdaY4').textContent,
            document.getElementById('ebitdaY5').textContent,
            '-'
        ],
        ['CAPEX', 
            document.getElementById('capexY1').value || 0,
            document.getElementById('capexY2').value || 0,
            document.getElementById('capexY3').value || 0,
            document.getElementById('capexY4').value || 0,
            document.getElementById('capexY5').value || 0,
            document.getElementById('capexCAGR').textContent
        ],
        ['FTEs', 
            document.getElementById('ftesY1').value || 0,
            document.getElementById('ftesY2').value || 0,
            document.getElementById('ftesY3').value || 0,
            document.getElementById('ftesY4').value || 0,
            document.getElementById('ftesY5').value || 0,
            document.getElementById('ftesCAGR').textContent
        ]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Planning');
}

function exportForecastingToExcel(workbook, companyName, orgNumber) {
    const currency = document.getElementById('currencyForecast').value;
    const metric = document.getElementById('metricSelect').options[document.getElementById('metricSelect').selectedIndex].text;
    
    const data = [
        ['Monthly Forecasting'],
        ['Company Name:', companyName],
        ['Organization Number:', orgNumber],
        ['Currency:', currency],
        ['Metric:', metric],
        [],
        ['Month', 'Plan', 'Actuals', 'Variance', 'Variance %']
    ];
    
    months.forEach((month, index) => {
        const planText = document.getElementById(`plan${index}`)?.textContent || '$0';
        const actualValue = document.getElementById(`actual${index}`)?.value || 0;
        const varianceText = document.getElementById(`variance${index}`)?.textContent || '$0';
        const variancePercentText = document.getElementById(`variancePercent${index}`)?.textContent || '0.00%';
        
        data.push([month, planText, actualValue, varianceText, variancePercentText]);
    });
    
    // Add totals
    data.push([]);
    data.push([
        'Total',
        document.getElementById('totalPlan').textContent,
        document.getElementById('totalActuals').textContent,
        document.getElementById('totalVariance').textContent,
        document.getElementById('totalVariancePercent').textContent
    ]);
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Forecasting');
}

// Set up Excel export button listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('exportExcelBtn')?.addEventListener('click', () => exportToExcel('income-statement'));
    document.getElementById('exportExcelBtnBS')?.addEventListener('click', () => exportToExcel('balance-sheet'));
    document.getElementById('exportExcelBtnCF')?.addEventListener('click', () => exportToExcel('cash-flow'));
    document.getElementById('exportExcelBtnPR')?.addEventListener('click', () => exportToExcel('profitability-ratios'));
    document.getElementById('exportExcelBtnPlan')?.addEventListener('click', () => exportToExcel('planning'));
    document.getElementById('exportExcelBtnForecast')?.addEventListener('click', () => exportToExcel('forecasting'));
});
