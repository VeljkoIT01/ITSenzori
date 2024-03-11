let chart;
let availableColors = ['#D30000', '#1260CC', '#1FD665', '#FF007F', '#FFD700', '#FF6600'];
let rawData;
let itemsPerPage = 100;
let totalPages = 0;
let currentPage = 1;
let headingArray = []; 

$(document).ready(function () {
    if ($('#myChart').html() === "") {
        $.get('https://raw.githubusercontent.com/VeljkoIT01/ITSenzori/main/main.CSV', function (data) { dataToArrays(data); createChart(rawData); }, 'text');
    }

    document.getElementById('csvFile').addEventListener('change', upload, false);
});

function dataToArrays(data) {
    rawData = Papa.parse(data);
    totalPages = Math.ceil(rawData.data.length / itemsPerPage);
    updatePagination();
    displayCurrentPageData();
}

function updatePagination() {
    let paginationElement = document.getElementById('pagination');
    let paginationHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" onclick="changePage(${i})">${i}</a></li>`;
    }

    paginationElement.innerHTML = paginationHTML;
}

function changePage(pageNumber) {
    currentPage = pageNumber;
    displayCurrentPageData();
}

function displayCurrentPageData() {
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = Math.min(startIndex + itemsPerPage, rawData.data.length);
    let currentPageData = rawData.data.slice(startIndex, endIndex);

    updatePagination();
    displayDataInTable(currentPageData);
}



function displayDataInTable(data) {
    // Prikazi paginaciju iznad tabele "Current data"
    updatePagination();

    let html = '<table class="table"><tbody>';
    data.forEach(element => {
        if (element.some(function (el) { return el !== null; })) {
            html += '<tr>';
            element.forEach(element => {
                html += '<td>' + (element !== null ? element : '') + '</td>';
            });
            html += '</tr>';
        }
    });
    html += '</tbody></table>';
    $('#parsedData').html(html);
}

function getColor() {
    if (availableColors.length > 0) {
        return availableColors.shift();
    } else {
        console.log("Nema više dostupnih boja.");
        return '#000000';
    }
}

function createChart(parsedData) {
    let dataArray = parsedData.data;
    let dataMatrix = [];

    let headingArray = [];

    for (let i = 0; i < dataArray[0].length; i++) {
        dataMatrix[i] = [];

        headingArray.push({
            title: dataArray[0][i],
            unit: dataArray[1][i],
            hidden: false,
        });
    }

    for (let i = 0; i < dataArray.length; i++) {
        for (let j = 0; j < dataArray[i].length; j++) {
            if (!dataArray[i][j]) {
                dataArray[i][j] = null;
            }
            dataMatrix[j][i] = dataArray[i][j];
        }
    }

    let commentIndex = headingArray.findIndex(element => {
        if (element.title === 'Comment') {
            return true;
        }
    });
    if (commentIndex !== -1) {
        dataMatrix.splice(commentIndex, 1);
        headingArray.splice(commentIndex, 1);
    }

    let html = '';
    html += '<table class="table"><tbody>';

    parsedData.data.forEach(element => {
        if (element.some(function (el) { return el !== null; })) {
            html += '<tr>';
            element.forEach(element => {
                html += '<td>' + (element !== null ? element : '') + '</td>';
            });
            html += '</tr>';
        }
    });
    html += '</tbody></table>';
    $('#parsedData').html(html);

    Chart.defaults.global.defaultFontFamily = 'Consolas';
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = 'black';

    Chart.defaults.global.elements.line.backgroundColor = 'transparent';

    let labels = dataMatrix[0];
    labels.splice(0, 3);

    let datasets = [];

    for (let i = 1; i < dataMatrix.length; i++) {
        let label = dataMatrix[i][0];

        if (!headingArray[i].hidden) { 
        let datasetData = dataMatrix[i];
        datasetData.splice(0, 3);

        datasets.push({
            label: label,
            data: datasetData,

            borderColor: getColor(),
            borderWidth: '2',

            pointRadius: 0,
        });
    }
}

    let myChart = document.getElementById('myChart').getContext('2d');
    let type = 'line';
    let data = {
        labels,
        datasets,
    };
    let options = {
        title: {
            display: true,
            text: ['Rezultati merenja na dan 22.01.2024.', ''],
            fontFamily: "sans-serif",
            fontSize: 26,
        },
        legend: {
            position: 'bottom',
            labels: {
                fontColor: 'black',
                fontFamily: "sans-serif",
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    fontFamily: "sans-serif",
                    fontSize: 14,
                }
            }],
            xAxes: [{
                ticks: {
                    fontFamily: "sans-serif",
                    fontSize: 14,
                }
            }]
        },
        tooltips: {
            intersect: false,
            callbacks: {
                title: (toolTipItem) => {
                    return headingArray[0].title + ": " + toolTipItem[0].label + " " + headingArray[0].unit;
                },
                label: (toolTipItem) => {
                    return toolTipItem.yLabel + " " + headingArray[toolTipItem.datasetIndex + 1].unit;
                },
            },
            titleFontSize: 16,
            bodyFontSize: 16,
        },
    };

    if (chart) {
        chart.destroy();
    }

    myChart.canvas.style.width = '80%';
    myChart.canvas.style.height = '430px';

    chart = new Chart(myChart, { type, data, options });
}

function upload(evt) {
    let data = null;
    let file = evt.target.files[0];
    let reader = new FileReader();
    try { reader.readAsText(file); } catch (e) { console.log(e) }
    reader.onload = function (event) {
        let csvData = event.target.result;
        data = csvData;
        if (data && data.length > 0) {
            console.log('Imported -' + data.length + '- rows successfully!');
            dataToArrays(data);
        } else {
            console.log('No data to import!');
        }
    };
    reader.onerror = function () {
        console.log('Unable to read ' + file.fileName);
    };
}

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("scrollToTopBtn").style.display = "block";
  } else {
    document.getElementById("scrollToTopBtn").style.display = "none";
  }
}

function topFunction() {
  document.body.scrollTop = 0; 
  document.documentElement.scrollTop = 0; 
}

document.getElementById('downloadButton').addEventListener('click', function() {
    let url = 'https://raw.githubusercontent.com/VeljkoIT01/ITSenzori/main/main.CSV';
    let filename = 'JAKOVLJEVIC LIVE 22 JAN 2024.csv'; // Promijenio sam ekstenziju u malim slovima

    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            // Stvaranje objekta za preuzimanje
            let a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = filename;
            a.style.display = 'none';
            
            // Dodavanje objekta na stranicu i emulacija klika
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(a.href);
            document.body.removeChild(a);
        })
        .catch(error => console.error('Došlo je do greške:', error));
});
