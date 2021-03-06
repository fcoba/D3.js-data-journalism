// Set up chart
var svgWidth = 960;
var svgHeight = 600;
var margin = {top: 20, right: 40, bottom: 80, left: 100};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select('#scatter')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);
//   .append('g')
  
var chartGroup = svg.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "poverty:";
  }
//   else {
//     var label = "# of Albums:";
//   }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.poverty}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data,this);
    d3.select(this)
      .attr("r", "40");
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
      d3.select(this)
        .attr("r", "10");
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/js/data.csv").then(function(healthData) {
    console.log(healthData)
  // if (err) throw err;

  // parse data
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
});
    
  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(healthData, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
  // var chartGroup = d3.select("#scatter").append("svg:svg");

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  var datapoints = chartGroup.selectAll("circle")
    .data(healthData)
    .enter();

  var circlesGroup = datapoints.append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 10)
    .attr("opacity", ".75")
    .attr("class", "stateCircle");

  datapoints.append("text")
    .attr("dx", function(d){return xLinearScale(d.poverty)})
    .attr("dy", d => yLinearScale(d.healthcare) + 5)
    .attr("class", "stateText")
    .text(function(d){return d.abbr});

  // append initial circles
  // var circlesGroup = chartGroup.selectAll("circle")
  //   .data(healthData)
  //   .enter()
  //   .append("circle")
  //   .attr("cx", d => xLinearScale(d.poverty))
  //   .attr("cy", d => yLinearScale(d.healthcare))
  //   .attr("r", 10)
  //   .attr("opacity", ".75")
  //   .attr("class", "stateCircle")
  //   // .append("text")
	//   // .attr("dx", function(d){return -20})
  //   // .text(function(d){return d.abbr})
  //   // .attr("class", "stateText");

  
    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>state: ${d.poverty}<br>:`);
    });

  // Step 7: Create tooltip in the chart
  // ==============================
  chartGroup.call(toolTip);

  // Step 8: Create event listeners to display and hide the tooltip
  // ==============================
  // circlesGroup.on("click", function(data) {
  //   toolTip.show(data);
  // })
    // onmouseout event
    // .on("mouseout", function(data) {
    //   toolTip.hide(data);
    // });

  // Create axes labels
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .text("Lacks Healthcare (%)");

  // chartGroup.append("text")
  //   .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
  //   .attr("class", "axisText")
  //   .text("Poverty (%)");


  circlesGroup.append("text")
    // .attr("dx", function(d){return -20})
    .text(function(d){return d.abbr})


  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var healthLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  var albumsLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Age");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("axis-text", true)
    .text("Smokes");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);
        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        // if (chosenXAxis === "num_albums") {
        //   albumsLabel
        //     .classed("active", true)
        //     .classed("inactive", false);
        //   hairLengthLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        // }
        // else {
        //   albumsLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        //   hairLengthLabel
        //     .classed("active", true)
        //     .classed("inactive", false);
        // }
      }
      
    });
  });
