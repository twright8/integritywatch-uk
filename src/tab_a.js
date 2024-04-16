//import jquery from 'jquery';
//window.jQuery = jquery;
//window.$ = jquery;
//var jQuery = jquery;

const jquery = require('jquery')
$ = window.$ = window.jQuery = jquery;

require('jquery-ui-bundle')
require('jquery-ui-bundle/jquery-ui.css')
require( 'datatables.net' )( window, $ )
require( 'datatables.net-dt' )( window, $ )

import underscore from 'underscore';
window.underscore = underscore;
window._ = underscore;

import '../public/vendor/js/popper.min.js'
import '../public/vendor/js/bootstrap.min.js'
import { csv } from 'd3-request'
import { json } from 'd3-request'

import '../public/vendor/css/bootstrap.min.css'
import '../public/vendor/css/dc.css'
import '/scss/main.scss';

import Vue from 'vue';
import Loader from './components/Loader.vue';
import ChartHeader from './components/ChartHeader.vue';

//import 'jquery-ui-bundle';
//import 'jquery-ui-bundle/jquery-ui.css';


// Data object - is also used by Vue

var vuedata = {
  page: 'tabA',
  loader: true,
  readMore: false,
  showInfo: true,
  showShare: true,
  showAllCharts: true,
  chartMargin: 40,
  travelFilter: 'all',
  charts: {
    level: {
      title: 'Role',
      info: 'This pie chart shows the proportion of meetings hosted by political role. Click on the pie chart to filter the rest of the tool by role.'
    },
    department: {
      title: 'Top 10 Public offices',
      info: 'Filter by public office.'
    },
    hosts: {
      title: 'TOP 10 HOSTS',
      info: 'This bar chart shows the hosts who have had the most contact with lobby organisations. Click on the bar chart to filter the rest of the tool by host.\n\n Note: Due to issues with the source data, when UK Government hosts meet several lobby organisations in a single meeting, the tool counts it as one single meeting. The number of contacts with individual lobbyists can therefore be higher than the number of meetings diplayed on this portal.'
    },
    organizations: {
      title: 'Top 10 Lobbyists',
      info: 'This bar chart shows lobby organisations who have had the most contact with hosts in the UK Government, Scottish Government, and Scottish Parliament. Click on the bar chart to filter the rest of the tool by lobby organisation.\n\n Note: Due to issues with the source data, this is only a rough figure for exploring the data. When UK Government hosts meet several lobby organisations in a single meeting, the tool counts it as one single meeting. The number of contacts between lobbyists and hosts can therefore be higher than the number of meetings diplayed on this portal. Conversely, when lobbyists meet multiple hosts in the Scottish Government or Parliament at the same time, we have split them out into individual rows.'
    },
    mainTable: {
      chart: null,
      type: 'table',
      title: 'Results',
      info: 'This table presents a list of meetings based on the filters you apply. Use the filters above to refine this view.'
    }
  },
  selectedElement: { "P": "", "Sub": ""},
  modalShowTable: '',
  colors: {
    //generic: ["#3b95d0", "#4081ae", "#406a95", "#395a75" ],
    generic: ["#981b48", "#b7255a", "#d73771", "#ec5189", "#ec7ca6"],
    //default: "#2180c2",
    default: "#d73771",
    default1: "#3694d1",
    colorSchemeCloud: ["#981b48", "#b7255a", "#d73771", "#ec5189", "#ec7ca6", "#f9b41b", "#e77a31", "#ffc138"]
    //colorSchemeCloud: [ "#4d9e9c", "#62aad9", "#3b95d0", "#42b983", "#449188", "#52c993", "#b7bebf", "#99b6c0" ]
  }
}



//Set vue components and Vue app

Vue.component('chart-header', ChartHeader);
Vue.component('loader', Loader);

new Vue({
  el: '#app',
  data: vuedata,
  methods: {
    //Share
    downloadDataset: function () {
      window.open('./data/iw_uk.csv');
    },
    share: function (platform) {
      if(platform == 'twitter'){
        var thisPage = window.location.href.split('?')[0];
        var shareText = 'Who’s lobbying ministers and legislators across the UK, when and why? ' + thisPage;
        var shareURL = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText);
        window.open(shareURL, '_blank');
        return;
      }
      if(platform == 'facebook'){
        var toShareUrl = 'https://openaccess.transparency.org.uk/';
        var shareURL = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(toShareUrl);
        window.open(shareURL, '_blank', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=250,top=300,left=300');
        return;
      }
    },
    //Copy to clipboard
    copyToClipboard: function(elId) {
      var textToCopy = document.getElementById(elId);
      textToCopy.select();
      textToCopy.setSelectionRange(0, 99999);
      document.execCommand("copy");
      console.log("Copied: " + textToCopy.value);
    }
  }
});

//Initialize info popovers
$(function () {
  $('[data-toggle="popover"]').popover()
})

//Charts
var charts = {
  level: {
    chart: dc.pieChart("#level_chart"),
    type: 'pie',
    divId: 'level_chart'
  },
  department: {
    chart: dc.rowChart("#department_chart"),
    type: 'row',
    divId: 'department_chart'
  },
  hosts: {
    chart: dc.rowChart("#hosts_chart"),
    type: 'row',
    divId: 'hosts_chart'
  },
  organizations: {
    chart: dc.rowChart("#organizations_chart"),
    type: 'row',
    divId: 'organizations_chart'
  },

  mainTable: {
    chart: null,
    type: 'table',
    divId: 'dc-data-table'
  }
}

//Functions for responsivness
var recalcWidth = function(divId) {
  return document.getElementById(divId).offsetWidth - vuedata.chartMargin;
};

var recalcCharsLength = function(width) {
  return parseInt(width / 8);
};
var calcPieSize = function(divId) {
  var newWidth = recalcWidth(divId);
  var sizes = {
    'width': newWidth,
    'height': 0,
    'radius': 0,
    'innerRadius': 0,
    'cy': 0,
    'legendY': 0
  }
  if(newWidth < 270) { 
    sizes.height = newWidth + 170;
    sizes.radius = (newWidth)/2;
    sizes.innerRadius = (newWidth)/4;
    sizes.cy = (newWidth)/2;
    sizes.legendY = (newWidth) + 30;
  } else {
    sizes.height = newWidth*0.75 + 170;
    sizes.radius = (newWidth*0.75)/2;
    sizes.innerRadius = (newWidth*0.75)/4;
    sizes.cy = (newWidth*0.75)/2;
    sizes.legendY = (newWidth*0.75) + 30;
  }
  return sizes;
};
var resizeGraphs = function() {
  for (var c in charts) {
    if((c == 'subject') && vuedata.showAllCharts == false){
    } else {
      var sizes = calcPieSize(charts[c].divId);
      var newWidth = recalcWidth(charts[c].divId);
      var charsLength = recalcCharsLength(newWidth);
      if(charts[c].type == 'row'){
        charts[c].chart.width(newWidth);
        charts[c].chart.label(function (d) {
          var thisKey = d.key;
          if(thisKey.indexOf('###') > -1){
            thisKey = thisKey.split('###')[0];
          }
          if(thisKey.length > charsLength){
            return thisKey.substring(0,charsLength) + '...';
          }
          return thisKey;
        })
        charts[c].chart.redraw();
      } else if(charts[c].type == 'bar') {
        charts[c].chart.width(newWidth);
        charts[c].chart.rescale();
        charts[c].chart.redraw();
      } else if(charts[c].type == 'pie') {
        charts[c].chart
          .width(sizes.width)
          .height(sizes.height)
          .cy(sizes.cy)
          .innerRadius(sizes.innerRadius)
          .radius(sizes.radius)
          .legend(dc.legend().x(0).y(sizes.legendY).gap(10).legendText(function(d) { 
            var thisKey = d.name;
            if(thisKey.length > charsLength){
              return thisKey.substring(0, charsLength) + '...';
            }
            return thisKey;
          }));
        charts[c].chart.redraw();
      } 
    }
  }
};

//Add commas to thousands
function addcommas(x){
  if(parseInt(x)){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return x;
}
//Custom date order for dataTables
var dmy = d3.timeParse("%d/%m/%Y");
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "date-eu-pre": function (date) {
    if(date.indexOf("Cancelled") > -1){
      date = date.split(" ")[0];
    }
      return dmy(date);
  },
  "date-eu-asc": function ( a, b ) {
      return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "date-eu-desc": function ( a, b ) {
      return ((a < b) ? 1 : ((a > b) ? -1 : 0));
  }
});

//Get URL parameters
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
//Generate random parameter for dynamic dataset loading (to avoid caching)
var randomPar = '';
var randomCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for ( var i = 0; i < 5; i++ ) {
  randomPar += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}
//Load data and generate charts
var lobbyist_typeList = {}

fetch('./data/iw_uk.json?' + randomPar)
  .then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(events => {
csv('./data/wdtk_departments.csv?' + randomPar, (err, wdtkDepartments) => {
  var downloadStart = performance.now();


  var parseDate = d3.timeParse("%d/%m/%Y");
  var now = Date.now();
  //var RecordId = 0;
  //Loop through data to aply fixes and calculations
  _.each(events, function (d) {
    if(!d.purpose){
      d.purpose = "";
    }	
    //d.RecordId = RecordId;
    d.date1 = d.date;
    if(d.date != ""){
      d.date = parseDate(d.date);
    }

    d.portfolio = '';
    d.ministerialLevel = "Others";
    switch(d.policy_level) {
      case 1:
        d.ministerialLevel = 'Minister';
        break;
      case 2:
        d.ministerialLevel = 'MSP';
        break;
      case 3:
        d.ministerialLevel = 'Special advisor';
        break;
      case 4:
        d.ministerialLevel = 'Senior civil servant';
        break;

      default:
        d.ministerialLevel = "Others";
    };
    //RecordId ++;
    var thisWdtkDep = _.find(wdtkDepartments, function (x) { return x.dep == d.department });
    if(thisWdtkDep) {
      d.department_wdtk = thisWdtkDep.wdtk_name;
    } else {
      d.department_wdtk = '';
    }
    //Generated url for pre-filled request
    var requestBaseUrl = 'https://www.whatdotheyknow.com/new/';
    var orgString = d.organisation;
    if(orgString.length > 400) {
      orgString = orgString.slice(0, 400);
      var lastWord = orgString.lastIndexOf(' ');
      orgString = orgString.substring(0, lastWord) + ' ...';
    }
    var formTitle = encodeURI('FOI request: Meeting held on '+ d.date1 +' with '+ d.rep_new +'.');
    var formMessage = 'Could you please acknowledge my request is being considered.\r\n'
    + 'For the meeting held on '+ d.date1 +' between '+ d.rep_new +' and '+ orgString +', with purpose '+ d.purpose +'\r\ncould you please provide the following information:\r\n\r\n'
    + '• A full list of attendees, including full names and titles as well as who the attendee represents\r\n'
    + '• A copy of the meeting agenda\r\n'
    + '• Meeting notes/minutes taken during the meeting, as well as any briefing notes and papers\r\n'
    + '• Any correspondence associated with the attendees, including debriefs of the meeting via email or other forms of communication.\r\n';
    formMessage = encodeURI(formMessage);
    d.requestFullUrl = requestBaseUrl + d.department_wdtk + '?title=' + formTitle + '&default_letter=' + formMessage;
    //Meeting url
    d.meetingUrl = window.location.href.split('?')[0] + '?meeting=' + d.RecordId;
  });

  //Set dc main vars. The second crossfilter is used to handle the travels stacked bar chart.
  var ndx = crossfilter(events);
              var downloadEnd = performance.now(); // End timing for download
        var downloadTime = downloadEnd - downloadStart; // Calculate download time
        console.log("data load: " + downloadTime + " milliseconds");
		  var downloadStart = performance.now();
  // Initialize Crossfilter with your dataset

  var searchDimension = ndx.dimension(function (d) {
    var entryString = d.rep_new + " " + d.organisation + " " + d.purpose + " " + d.policy_level + " " + d.department + " " + d.ministerialLevel + " " + d.registrant_additional_information;
    return entryString.toLowerCase();
  });
  var dateEvent = ndx.dimension(function(d) {
		if(!d.date){
			return "";
		}
		return d.date;
	});
	

// Assuming this is placed inside your CSV loading callback, after initializing your crossfilter `ndx`
function exportFilteredData() {
    // Assuming 'ndx' is your crossfilter instance
    var allFilteredData = ndx.allFiltered(); // This retrieves all records that match the current filters

    // Convert the filtered data to CSV format
    const csvRows = [];
    const headers = Object.keys(allFilteredData[0]);
    csvRows.push(headers.join(',')); // Add header row

    allFilteredData.forEach(row => {
        const values = headers.map(header => JSON.stringify(row[header]));
        csvRows.push(values.join(','));
    });

    const csvData = csvRows.join('\n');

    // Trigger download
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", 'filtered-data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Example: Bind the export function to a button click event
document.getElementById('exportButton').addEventListener('click', exportFilteredData);

// Assuming ndx is your Crossfilter instance and is already defined and initialized
// with your dataset somewhere in your script before this code block.

// Create a dimension based on the "portal_source" column
// Assuming ndx is already defined and is your crossfilter instance
var sourceDimension = ndx.dimension(function(d) {
  return d.portal_source;
});

// Tracks which filters are currently active
var activeFilters = {
  'Scottish lobbying register': false,
  'UK Government': false
};

// Function to initialize button states and event listeners
function initializeButton(buttonId, filterValue) {
  var button = document.getElementById(buttonId);
  button.style.backgroundColor = '#D3D3D3'; // Default state for non-active filters

  button.addEventListener('click', function() {
    // Toggle the active state of the filter
    activeFilters[filterValue] = !activeFilters[filterValue];
    // Show loader immediately
    Vue.set(vuedata, 'loader', true);
    // Apply filters and update UI
    requestAnimationFrame(() => {
      applyFilters();
    });
  });
}

// Applies active filters to the dimension and updates the UI accordingly
function applyFilters() {
  var activeFilterValues = Object.keys(activeFilters).filter(key => activeFilters[key]);

  // Filter data based on active filters
  if (activeFilterValues.length === 0) {
    sourceDimension.filterAll();
  } else {
    sourceDimension.filter(function(d) {
      return activeFilterValues.includes(d);
    });
  }

  // Update button styles and disable loader after UI updates
  setTimeout(() => {
    updateButtonStyles();
    Vue.set(vuedata, 'loader', false); // Hide loader after updating the UI
    dc.redrawAll(); // Redraw charts with the new filter
  }, 0);
}

// Updates the styles of buttons based on the active filters
function updateButtonStyles() {
  Object.entries(activeFilters).forEach(([filterValue, isActive]) => {
    var buttonId = filterValue === 'Scottish lobbying register' ? 'filter-source-button-scot' : 'filter-source-button-uk';
    var button = document.getElementById(buttonId);
    button.style.backgroundColor = isActive ? '#3694d1' : '#D3D3D3';
	button.style.boxShadow = isActive ? '0 2px 4px rgba(0, 0, 0, 0.5)' : 'none';
    button.disabled = false; // Re-enable the button after processing
  });
}

// Initialize buttons with their respective filter values
initializeButton('filter-source-button-scot', 'Scottish lobbying register');
initializeButton('filter-source-button-uk', 'UK Government');



var tagDimension = ndx.dimension(function (d) {
  return d.tag;
});

// Initial state of the filters
var activeFilters = [];

// Function to update the dimension filter based on active filters
function updateDimensionFilter() {
  if (activeFilters.length === 0) {
    tagDimension.filterAll();
  } else {
    tagDimension.filter(function (d) {
      return activeFilters.includes(d);
    });
  }
  dc.redrawAll();
}

// Function to toggle the filter state
function toggleFilterState(filter) {
  const index = activeFilters.indexOf(filter);
  if (index === -1) {
    activeFilters.push(filter);
  } else {
    activeFilters.splice(index, 1);
  }
  updateDimensionFilter();
}
const filterIcons = {
  Climate: 'leaf',
  "Financial Services": 'piggy-bank',
  Health: 'heart-pulse',
  Technology: 'microchip',
  Defence: 'shield-halved',
};
// Setup buttons
const filters = ['Climate', 'Financial Services', 'Health', 'Technology', 'Defence']; // Example filters
filters.forEach(filter => {
  const button = document.createElement('button');
  const iconName = filterIcons[filter];
  button.innerHTML = `<i class="fa fa-${iconName} icon-white"></i>`; // Apply 'icon-white' class
  button.classList.add('filter-button');
  button.dataset.filter = filter;
  button.title = filter; // Set the tooltip text to the filter name

  button.addEventListener('click', function () {
    // Disable button immediately to prevent multiple clicks
    this.disabled = true;
    
    // Use requestAnimationFrame to ensure loader is shown in the next frame
    requestAnimationFrame(() => {
      vuedata.loader = true; // Show loader

      // Defer the rest of the logic
      setTimeout(() => {
        const filter = this.dataset.filter;
        toggleFilterState(filter);
        this.classList.toggle('active'); // Toggle a class that changes the button's appearance

        if (this.classList.contains('active')) {
          this.style.backgroundColor = '#3694d1'; // Example active color
        } else {
          this.style.backgroundColor = ''; // Reset to default
        }

        // Schedule the UI update to hide the loader and re-enable the button
        requestAnimationFrame(() => {
          this.disabled = false;
          vuedata.loader = false;
        });
      }, 0); // Execute the deferred logic immediately after the current call stack clears
    });
  });

  document.getElementById('filter-buttons').appendChild(button);
});


//chart 1
  var createLevelChart = function() {
    var order = ['Minister', 'MSP', 'Special advisor', 'Senior civil servant']
    var chart = charts.level.chart;
    var dimension = ndx.dimension(function (d) {
      return d.ministerialLevel;
    });
    var group = dimension.group().reduceSum(function (d) { return 1; });
    var sizes = calcPieSize(charts.level.divId);
    chart
      .width(sizes.width)
      .height(sizes.height)
      .cy(sizes.cy)
      .innerRadius(sizes.innerRadius)
      .radius(sizes.radius)
      .legend(dc.legend().x(0).y(sizes.legendY).gap(10).legendText(function(d) { 
        var thisKey = d.name;
        if(thisKey.length > 40){
          return thisKey.substring(0,40) + '...';
        }
        return thisKey;
      }))
      .title(function(d){
        var thisKey = d.key;
        return thisKey + ': ' + d.value;
      })
      .dimension(dimension)
      .ordering(function(d) { return order.indexOf(d.key)})
      .ordinalColors(["#981b48", "#b7255a", "#d73771", "#ec5189", "#ccc"])
      /*
      .colorCalculator(function(d, i) {
        return vuedata.colors.institutionsTypes[d.key];
      })
      */
      .group(group);

    chart.render();
  }






  //CHART 2 Revised with Filtering and Limiting to 10 Maximum
var createDepartmentChart = function() {
    var chart = charts.department.chart;
    var dimension = ndx.dimension(function (d) {
      return d.department; 
    });
    var group = dimension.group().reduceSum(function (d) {
        return 1;
    });

    // Filtering to exclude departments with no records and limit to top 10
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.all().filter(function(d) {
            return (d.value != 0);
          }).sort(function(a, b) {
            return b.value - a.value; // Sort by value in descending order
          }).slice(0, 10); // Take only the top 10
        }
      };
    })(group);

    var width = recalcWidth(charts.department.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(420)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup) // Use the filtered and limited group
      .dimension(dimension)
      .colorCalculator(function(d, i) {
        return vuedata.colors.default;
      })
      .label(function (d) {
        if(d.key && d.key.length > charsLength){
          return d.key.substring(0,charsLength) + '...';
        }
        return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + d.value;
      })
      .elasticX(true)
      .xAxis().ticks(4);
      chart.render();
}


  //CHART 3
  var createHostsChart = function() {
    var chart = charts.hosts.chart;
    var dimension = ndx.dimension(function (d) {
      return d.rep_new;;
    });
    var group = dimension.group().reduceSum(function (d) {
        return 1;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(10).filter(function(d) {
            return (d.value != 0);
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.hosts.divId);
    var charsLength = recalcCharsLength(width);
    
    chart
      .width(width)
      .height(420)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .colorCalculator(function(d, i) {
        return vuedata.colors.default;
      })
      .label(function (d) {
          if(d.key && d.key.length > charsLength){
            return d.key.substring(0,charsLength) + '...';
          }
          return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + d.value;
      })
      .elasticX(true)
      .xAxis().ticks(4);
      //chart.xAxis().tickFormat(numberFormat);
      chart.render();
  }

  //CHART 4
  var createOrganizationsChart = function() {
    var chart = charts.organizations.chart;
    var dimension = ndx.dimension(function (d) {
      return d.organisation;
    });
    var group = dimension.group().reduceSum(function (d) {
        return 1;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(10).filter(function(d) {
            return (d.value != 0);
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.organizations.divId);
    var charsLength = recalcCharsLength(width);
    
    chart
      .width(width)
      .height(420)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .colorCalculator(function(d, i) {
        return vuedata.colors.default1;
      })
      .label(function (d) {
          if(d.key && d.key.length > charsLength){
            return d.key.substring(0,charsLength) + '...';
          }
          return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + d.value;
      })
      .elasticX(true)
      .xAxis().ticks(4);
      //chart.xAxis().tickFormat(numberFormat);
      chart.render();
  }

  //CHART 5
 

  //TABLE
  var createTable = function() {
    var count=0;
    charts.mainTable.chart = $("#dc-data-table").dataTable({
      "columnDefs": [
        {
          "searchable": false,
          "orderable": false,
          "targets": 0,   
          data: function ( row, type, val, meta ) {
			   
            return count;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 1,
          "defaultContent":"N/A",
          "data": function(d) {
            //id,function,party,institution,date,contact_type,org_name,lobbyist_type,purpose,purpose_details
            return d.rep_new;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 2,
          "defaultContent":"N/A",
          "data": function(d) {
            switch(d.policy_level) {
                    case 1:
                        return "Minister";
                    case 2:
                        return "MSP";  // Member of Scottish Parliament
                    case 3:
                        return "Special advisor";
                    case 4:
                        return "Senior civil servant";
                    default:
                        return "Not specified";  // Default case if none of the above
                }
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 3,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.department;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 4,
          "defaultContent":"N/A",
          "data": function(d) {
			  return d.purpose.replace(/\n/g, "<br>");
            return d.purpose;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 5,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.organisation;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 6,
          "defaultContent":"N/A",
          "type":"date-eu",
          "data": function(d) {
            if (!d.date) {
              return d.date1;
            }
					  return d.date.getDate()+"/"+(1+d.date.getMonth())+"/"+d.date.getFullYear();
          }
        }

      ],
      "iDisplayLength" : 25,
      "bPaginate": true,
      "bLengthChange": true,
      "bFilter": false,
      "order": [[ 6, "desc" ]],
      "bSort": true,
      "bInfo": true,
      "bAutoWidth": false,
      "bDeferRender": true,
      "aaData": searchDimension.top(Infinity),
      "bDestroy": true,
    });
    var datatable = charts.mainTable.chart;
    datatable.on( 'draw.dt', function () {
      var PageInfo = $('#dc-data-table').DataTable().page.info();
        datatable.DataTable().column(0, { page: 'current' }).nodes().each( function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
      });
      datatable.DataTable().draw();

    $('#dc-data-table tbody').on('click', 'tr', function () {
      var data = datatable.DataTable().row( this ).data();
      vuedata.selectedElement = data;
      $('#detailsModal').modal();
    });
  }
  //REFRESH TABLE
  function RefreshTable() {
    dc.events.trigger(function () {
      var alldata = searchDimension.top(Infinity);
      charts.mainTable.chart.fnClearTable();
      charts.mainTable.chart.fnAddData(alldata);
      charts.mainTable.chart.fnDraw();
    });
  }

  //SEARCH INPUT FUNCTIONALITY

var typingTimer;
var doneTypingInterval = 1000;
var $input = $("#search-input");

// Keyup event to start the timer
$input.on('keyup', function () {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(doneTyping, doneTypingInterval);
});

// Keydown event to clear the timer
$input.on('keydown', function () {
  clearTimeout(typingTimer);
});

function doneTyping() {
  var s = $input.val().toLowerCase();
  // Extract phrases in quotation marks and individual words outside quotation marks
  var phrases = s.match(/"[^"]+"|\S+/g) || [];
  
  searchDimension.filter(function(d) {
    var entry = d; // The current entry string to be searched
    var allMatch = true; // Flag to keep track of whether all search terms match
    
    phrases.forEach(function(phrase) {
      var exactMatch = phrase.startsWith('"') && phrase.endsWith('"');
      var searchPhrase = exactMatch ? phrase.slice(1, -1) : phrase;
      
      if (exactMatch) {
        // For exact phrase matches, check if the phrase exists in the entry as is
        if (entry.indexOf(searchPhrase) === -1) allMatch = false;
      } else {
        // For non-exact (individual word) matches, ensure each word is present anywhere in the string
        var words = searchPhrase.split(" ");
        words.forEach(function(word) {
          if (entry.indexOf(word) === -1) allMatch = false;
        });
      }
    });
    
    return allMatch;
  });
  
  throttle();
}

var throttleTimer;
function throttle() {
  window.clearTimeout(throttleTimer);
  throttleTimer = window.setTimeout(function() {
    dc.redrawAll();
  }, 250);
}

  //DATEPICKER FUNCTIONALITY
  var inidate;
  var enddate;
  //Get current date for datepicker end date
  var currentDate = function(sp){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    if(dd<10) dd='0'+dd;
    if(mm<10) mm='0'+mm;
    return (dd+sp+mm+sp+yyyy);
  };
  //Initialize datepicker
  var dateFormat = "dd/mm/yy",
	from = $( "#from" ).datepicker({
		defaultDate: "01/01/2012",
		changeMonth: true,
		dateFormat: "dd/mm/yy"
	})
	.on( "change", function() {
		to.datepicker( "option", "minDate", getDate( this ) );
		inidate = getDate( this );	  
	}),
	to = $( "#to" ).datepicker({
	defaultDate: currentDate("/"),
	changeMonth: true,
	dateFormat: "dd/mm/yy"
	})
	.on( "change", function() {
	from.datepicker( "option", "maxDate", getDate( this ) );
	enddate = getDate( this );
  });
  //Get date
  function getDate(element) {
		var date;
		try {
		date = $.datepicker.parseDate( dateFormat, element.value );
		} catch( error ) {
		date = null;
		}
		return date;
  }
  //Set ini and end default dates
	$( "#from" ).val('01/01/2012');
	$( "#to" ).val(currentDate("/"));
	inidate = $( "#from" ).datepicker( "getDate" );
  enddate = $( "#to" ).datepicker( "getDate" );
  
  //Date filter
  $("#datefilter").click(function () {
    dateEvent.filter(function(d) { 
      return (d == "" || ((d.getTime() >= inidate.getTime()) && (d.getTime() <= enddate.getTime())));
    });
		throttle();
		var throttleTimer;
		function throttle() {
			window.clearTimeout(throttleTimer);
			throttleTimer = window.setTimeout(function() {
				dc.redrawAll();
			}, 250);
		}
  });
  


// Reset charts and filters
var resetGraphs = function() {
	
  for (var c in charts) {
    if(charts[c].type !== 'table' && charts[c].chart.hasFilter()){
      charts[c].chart.filterAll();
    }
  }

  // Resetting sourceDimension and tagDimension filters
  sourceDimension.filter(null);




  // Additional resets you might have
  searchDimension.filter(null);
  dateEvent.filter(null);
  $('#search-input').val('');
    // Clear the activeFilters array
  activeFilters = [];
var buttons = document.getElementsByClassName('regbutton');

// Loop through the NodeList of selected elements
for(var i = 0; i < buttons.length; i++) {
    // For each element, remove the 'active' class
    buttons[i].classList.remove('active');
    // Change the background color to #D3D3D3
    buttons[i].style.backgroundColor = '#D3D3D3';
}
  // Call the function that updates the dimension filter based on activeFilters
  updateDimensionFilter();

  // Reset all filter buttons to default state
  filters.forEach(filter => {
    const button = document.querySelector(`[data-filter="${filter}"]`);
    if(button) {
      button.classList.remove('active');
      button.style.backgroundColor = ''; // Reset to default, adjust as necessary
    }
  });	 

  // Redraw all charts to reflect the current state
  dc.redrawAll();
}

// Attaching the reset function to the reset button's click event
$('.reset-btn').click(function(){
	    this.disabled = true;
    
    // Use requestAnimationFrame to ensure loader is shown in the next frame
    requestAnimationFrame(() => {
      vuedata.loader = true; // Show loader

      // Defer the rest of the logic
      setTimeout(() => {
  resetGraphs();

        // Schedule the UI update to hide the loader and re-enable the button
        requestAnimationFrame(() => {
          this.disabled = false;
          vuedata.loader = false;
        });
      }, 0); // Execute the deferred logic immediately after the current call stack clears
    });
  });

  var downloadStart = performance.now();

  //Render charts
  createLevelChart();
            var downloadEnd = performance.now(); // End timing for download
        var downloadTime = downloadEnd - downloadStart; // Calculate download time
        console.log("Download time level: " + downloadTime + " milliseconds");
		  var downloadStart = performance.now();

  createDepartmentChart();
            var downloadEnd = performance.now(); // End timing for download
        var downloadTime = downloadEnd - downloadStart; // Calculate download time
        console.log("department timze: " + downloadTime + " milliseconds");
		  var downloadStart = performance.now();

  createHostsChart();
            var downloadEnd = performance.now(); // End timing for download
        var downloadTime = downloadEnd - downloadStart; // Calculate download time
        console.log("Download hosts: " + downloadTime + " milliseconds");
		  var downloadStart = performance.now();

  createOrganizationsChart();
            var downloadEnd = performance.now(); // End timing for download
        var downloadTime = downloadEnd - downloadStart; // Calculate download time
        console.log("Download orgs: " + downloadTime + " milliseconds");
		  var downloadStart = performance.now();


  createTable();
            var downloadEnd = performance.now(); // End timing for download
        var downloadTime = downloadEnd - downloadStart; // Calculate download time
        console.log("table timze: " + downloadTime + " milliseconds");


  $('.dataTables_wrapper').append($('.dataTables_length'));

  //Toggle last charts functionality and fix for responsiveness
  vuedata.showAllCharts = false;
  
  


  //Hide loader
  vuedata.loader = false;

  //COUNTERS
  //Main counter
  var all = ndx.groupAll();
  var counter = dc.dataCount('.dc-data-count')
    .dimension(ndx)
    .group(all);
  counter.render();
  //Update datatables
  counter.on("renderlet.resetall", function(c) {
    RefreshTable();
  });

  //Lobbyists counter
  function drawLobbyistsCounter() {
    var dim = ndx.dimension (function(d) {
      if (!d.organisation) {
        return "";
      } else {
        return d.organisation;
      }
    });
    var group = dim.group().reduce(
      function(p,d) {  
        p.nb +=1;
        if (!d.organisation) {
          return p;
        }
        return p;
      },
      function(p,d) {  
        p.nb -=1;
        if (!d.Id) {
          return p;
        }
        return p;
      },
      function(p,d) {  
        return {nb: 0}; 
      }
    );
    group.order(function(p){ return p.nb });
    var counter = dc.dataCount(".count-box-orgs")
    .dimension(group)
    .group({value: function() {
      return group.all().filter(function(kv) {
        if (kv.value.nb >0) {
        }
        return kv.value.nb > 0; 
      }).length;
    }})
    .renderlet(function (chart) {
    });
    counter.render();
  }
  //drawLobbyistsCounter();

  //Window resize function
  window.onresize = function(event) {
    resizeGraphs();
  };

  //After loading charts, load meeting if meeting parameter in url is present
  if(getParameterByName('meeting')) {
    var preselectedMeetingId = getParameterByName('meeting');
    //Find meeting by id. If it exists set it as selectedElement and open modal
    var preselectedMeeting = _.find(events, function (x) { return x.RecordId == preselectedMeetingId });
    if(preselectedMeeting) {
      vuedata.selectedElement = preselectedMeeting;
      $('#detailsModal').modal();
    }
  }
})
}).catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
function toggleDropup() {
  const downloadDropdown = document.getElementById('download-dropdown'); // Target specific dropdown
  if (window.innerWidth <= 992) {
    downloadDropdown.classList.add('dropup');
  } else {
    downloadDropdown.classList.remove('dropup');
  }
}

// Listen for window resize events
window.addEventListener('resize', toggleDropup);

// Initial check on page load
window.addEventListener('DOMContentLoaded', toggleDropup);

