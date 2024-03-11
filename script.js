let chart = document.getElementById('myChart');

$(document).ready(function () {
    if ($('#myChart').html() === "") {
        $.get('https://raw.githubusercontent.com/VeljkoIT01/ITSenzori/main/main.CSV', function (data) { dataToArrays(data) }, 'text');

    }

    document.getElementById('csvFile').addEventListener('change', upload, false);

});

function dataToArrays(data) {
    let rawData = Papa.parse(data);
   
    createChart(rawData);
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
        })
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
    html += '</tbody></table>'
    $('#parsedData').html(html);

    console.log(parsedData);
    console.log(dataMatrix);
    console.log(headingArray);

    /* Global chart options */

    Chart.defaults.global.defaultFontFamily = 'sans-serif';
    Chart.defaults.global.defaultFontSize = 15;
    Chart.defaults.global.defaultFontColor = 'black';

    Chart.defaults.global.elements.line.backgroundColor = 'transparent';

    /* /Global chart options */

    /* Data */

    let labels = dataMatrix[0];
    labels.splice(0, 3);

    let datasets = [];

    for (let i = 1; i < dataMatrix.length; i++) {
        let label = dataMatrix[i][0];
        let datasetData = dataMatrix[i];
        datasetData.splice(0, 3);
    
        let color = getColor()[i - 1]; // Odaberite boju iz niza boja na osnovu indeksa
        datasets.push({
            label: label,
            data: datasetData,
    
            borderColor:color,
            borderWidth: '1',
            backgroundColor: color,
            pointRadius: 0,
            fill:false,
        });
    }
    

    /* /Data */

    let myChart = document.getElementById('myChart').getContext('2d');
    let type = 'line';
    let data = {
        labels,
        datasets,
    };
    let options = {
        title: {
            display: true,
            text: ['Rezultati merenja'],
            fontSize: 23,
        },
        legend: {
            position: 'bottom',
            labels: {
                fontColor: 'black',
                fontSize: 20,

            }
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
        },
    };

    chart = new Chart(myChart, { type, data, options });
}

function getColor() {
    const colors = ['#D30000', '#1260CC', '#1FD665', '#FF007F', '#FFD700', '#FF6600'];
    return colors;
}


function upload(evt) {
    if (chart != null) {
        chart.destroy();
    }

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
