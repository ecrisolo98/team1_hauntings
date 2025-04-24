
    function getJSONData (url) {
         var xmlhttp=new XMLHttpRequest();

         try{
         xmlhttp.open("GET",url,false); 
         xmlhttp.setRequestHeader("Content-type", "application/json");
         
         xmlhttp.send(); 
         }
         catch(err){
              alert("Entered file does not exist");
              return "";
         }
         if(xmlhttp.status==404){
             alert("Entered file does not exist");
             return "";
         }
         jsonDoc=xmlhttp.responseText;
         // console.log(jsonDoc);
         return jsonDoc;
    }

    var description = getJSONData("../data/haunted_places_object_count.json");
    var frequency_list = JSON.parse(description);


    var color = d3.scale.linear()
            .domain([0,1,2,3,4,5,6,10,15,20,100])
            .range(["#D0CFCF","#e8c9c9","#efa7a7","#f58484","#d882a0","#eaae6b","#efa350","#f3850c","#c74573","#ef6464","#9c4108","#9c4108"]
);

// if(d.freq>120) return 40; if(d.freq>100) return 30; 
//                 if(d.freq>80) return 20; if(d.freq>60) return 10; return 5;

    d3.layout.cloud().size([1200, 600])
            .words(frequency_list).padding(5)
            .rotate(0)//function(d) { return Math.floor(Math.random() * Math.floor(45)); })
            .text(function(d) { return d.text; })
            .fontSize(function(d) { return d.frequency - 80; })
            .on("end", draw_description)
            .start();

    function draw_description(words) {
        d3.select("#description").append("svg")
                .attr("width", 1200)
                .attr("height", 450)
                .attr("class", "wordcloud")
                .append("g")
                .attr("transform", "translate(500,200)")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) { return (d.frequency - 140) + "px"; })
                .style("fill", function(d, i) { return color(i); })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; });
    }
