const imgHolder = document.getElementById("sl")
const pointBlock = document.getElementById("pointBlock")

var listImg = ["source/photo.jpeg","source/photo2.jpeg","source/photo3.jpeg","source/photo4.jpeg"]

window.addEventListener("load", function(){
    for(let i=0;i<listImg.length;i++){
        var point = $("<div></div>", { 'class': 'point','id':'pointbtn','value' :i});
        point.on( "click", function(e) {
            imgHolder.src = listImg[parseInt(e.target.getAttribute('value'))]
            $("[id='pointbtn']").removeClass("point-select")
            $(this).addClass("point-select")
        });
        
        point.appendTo(pointBlock); 
    }
})

