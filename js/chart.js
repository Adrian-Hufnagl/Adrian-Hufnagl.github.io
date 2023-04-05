  var root2 = am5.Root.new("chartdiv-2");
  var chart2 = root2.container.children.push(
    am5xy.XYChart.new(root2, {})
  );



  var yAxis = chart2.yAxes.push(
    am5xy.ValueAxis.new(
      root2, {
        min: -50,
        max: 60,
      renderer: am5xy.AxisRendererY.new(root2, {}),
    })
  );

  //var rangeDataItem = yAxis.makeDataItem({
  //  value: -50,
  //  endValue: 60
  //});
//
  //var range = yAxis.createAxisRange(rangeDataItem);

  var xAxis = chart2.xAxes.push(

    am5xy.CategoryAxis.new(root2, {
      categoryField: "month",
      renderer: am5xy.AxisRendererX.new(root2, {
        minGridDistance: 20,
      }),
      tooltip: am5.Tooltip.new(root2, {})
    })
  );

  xAxis.data.setAll([
    {month: "Jan"},
    {month: "Feb"},
    {month: "Mar"},
    {month: "Apr"},
    {month: "May"},
    {month: "Jun"},
    {month: "Jul"},
    {month: "Aug"},
    {month: "Sep"},
    {month: "Oct"},
    {month: "dsdsd"},
    {month: "dee"}
  ]);


// Set the chart data
  var data = [{
    month: "Jan",
    temp: 20,
    prec: 202
  }, {
    month: "Feb",
    temp: 22,
    prec: 102
  }, {
    month: "Mar",
    temp: 33,
    prec: 102
  }, {
    month: "Apr",
    temp: 21,
    prec: 202
  }, {
    month: "May",
    temp: 20,
    prec: 2
  }, {
    month: "Jun",
    temp: 5,
    prec: 12
  }, {
    month: "Jul",
    temp: -5,
    prec: 48
  }, {
    month: "Aug",
    temp: -12,
    prec: 78
  }, {
    month: "Sep",
    temp: -22,
    prec: 66
  }, {
    month: "Oct",
    temp: -17,
    prec: 70
  }, {
    month: "Nov",
    temp: -7,
    prec: 112
  }, {
    month: "Dec",
    temp: 3,
    prec: 188
  }];

  function transformData(data) {
    // Half Precipitation and Shrink > 100
    for (var i = 0; i < data.length; i++) {
      data[i].prec = data[i].prec / 2;
      if (data[i].prec > 50) {
        data[i].prec = 50 + (data[i].prec - 50) / 10;
      }
    }
  }

  xAxis.data.setAll(data);

  var series1 = chart2.series.push(
    am5xy.ColumnSeries.new(root2, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "prec",
      categoryXField: "month",
    })
  );

  var series2 = chart2.series.push(
    am5xy.LineSeries.new(root2, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "temp",
      openValueYField: "prec",
      categoryXField: "month",
      stroke: "#dd2211",
      fill: "#4084c8",
      tooltip: am5.Tooltip.new(root2, {
        labelText: "{valueY}"
      })
    })
  );

  series2.strokes.template.setAll({
    strokeWidth: 4,
  });

  function createNewGraph(newData) {
    transformData(newData)
    series1.data.setAll(newData);
    series2.data.setAll(newData);
  }


  var precDensity = yAxis.makeDataItem({ value: 50, endValue: 100 });
  var tempFreezing = yAxis.makeDataItem({ value: 0, endValue: -50 });
  var precRange = series1.createAxisRange(precDensity);
  precRange.columns.template.setAll({
    fill: am5.color(0x1f62ff),
    stroke: am5.color(0x1f62ff)
  });
  var tempRange = series2.createAxisRange(tempFreezing);
  tempRange.fills.template.setAll({
    visible: true,
    opacity: 0.3,
  });



  tempRange.fills.template.set("fill", am5.color(0x000000));
  tempRange.strokes.template.set("stroke", am5.color(0x3377ff));

  tempFreezing.get("grid").setAll({
    strokeOpacity: 0.5,
    visible: true,
    stroke: am5.color(0xa1a5a9),
    strokeDasharray: [2, 2],
    strokeWidth: 2
  })

  precDensity.get("grid").setAll({
    strokeOpacity: 0.5,
    visible: true,
    stroke: am5.color(0xa1a5a9),
    strokeDasharray: [2, 2],
    strokeWidth: 2
  })
