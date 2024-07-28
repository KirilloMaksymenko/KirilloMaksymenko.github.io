function inlineSVG(imgElement, color) {
    var imgClass = imgElement.width
    var imgURL = imgElement.src;
    
    console.log(imgClass)

    fetch(imgURL)
        .then(response => response.text())
        .then(svgText => {
            var parser = new DOMParser();
            var svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            var svgElement = svgDoc.querySelector('svg');
            
            
            svgElement.style.fill = color;
            svgElement.width = imgClass
            imgElement.parentNode.replaceChild(svgElement, imgElement);
        })
        .catch(error => console.error('Error fetching SVG:', error));
}


function initPage(){
    
    var state = "catalog"

    const listHead = ["/pages/shopping/shoppingbag_screen.html #head", "/pages/product/product_screen.html #head", "/pages/wishlist/wishlisy_screen.html #head", "/pages/shop/shop_screen.html #head"]

    for (let index = 0; index < listHead.length; index++) {
        var $el = $("<div>").load(listHead[index])
        $( "#head-main" ).append($el);
    }



    $( "#includeProduct" ).load( "/pages/product/product_screen.html #container");
    $( "#includedContent" ).load( "/pages/shop/shop_screen.html #container");


    $( "#footerCatalog" ).on( "click", function() {
        if(state != "catalog"){
            $( ".footer-item" ).removeClass( "select-footer" );
            $( "#footerCatalog" ).addClass( "select-footer" );

            $( "#includedContent" ).empty();

            $( "#includedContent" ).load( "/pages/shop/shop_screen.html #container");
            
            state = "catalog"
        }
        
    });



    $( "#footerFavorite" ).on( "click", function() {
        if(state != "favorite"){
            $( ".footer-item" ).removeClass( "select-footer" );
            $( "#footerFavorite" ).addClass( "select-footer" );

            $( "#includedContent" ).empty();

            $( "#includedContent" ).load( "/pages/wishlist/wishlisy_screen.html #container");
            
            state = "favorite"
        }
    } );


    $( "#footerBag" ).on( "click", function() {
        if(state != "bag"){
            $( ".footer-item" ).removeClass( "select-footer" );
            $( "#footerBag" ).addClass( "select-footer" );

            $( "#includedContent" ).empty();
            
            $( "#includedContent" ).load( "/pages/shopping/shoppingbag_screen.html #container");
            
            state = "bag"
        }
  } );
}

  
function detectMob() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}


function initSlidePanel(){

    if (detectMob()){
        document.addEventListener('touchend', endTouch, false);   
        document.addEventListener('touchstart', startTouch, false); 
        document.addEventListener('touchmove', handleTouchMove, false);
    }else{
        document.addEventListener('mouseup', endTouch, false);   
        document.addEventListener('mousedown', startTouch, false); 
        document.addEventListener('mousemove', handleTouchMove, false);  
    }  




    const productCont = document.getElementById('includeProduct')
    productCont.style.transition = 'transform .1s';
    productCont.style.transform = `translateY(${$( window ).height()}px)`;
    
    
    var isHide = true
    var yDown = null;
    var initY =null
    var sectionScreen = null
    var yDiff = null


    $(document.body).on('click', '#productLink' ,function(){  
        console.log("Open Product")
        openProduct("")
        
    });


 

    function openProduct(data){
        isHide = false

        $( "#includedContent" ).addClass( "hide-content" );
        $('body').css("overflow","hidden")

        productCont.style.transform = `translateY(${0}px)`;
    }  


    function touchDetect(e){
        if (detectMob()){
            return e.touches[0].clientY;
        }else{
            return e.clientY;
        }
    }

    function startTouch(e) {

        yDown = touchDetect(e);      
        initY = getTranslateY(productCont)  
    };     
    function endTouch(e) {
        
        sectionScreen = (($( window ).height()/Math.abs(initY-yDiff))*10)
        console.log("end " +sectionScreen)
        if (sectionScreen < 20){
            productCont.style.transform = `translateY(${$( window ).height()}px)`;
            isHide = true 
            $( "#includedContent" ).removeClass( "hide-content" );
            $('body').css("overflow","visible")
        }
        yDown = null
    };  
    function getTranslateY(element) {
        const style = window.getComputedStyle(element);
        const transform = style.transform;
        if (transform === 'none') {
            return 0;
        }
        const matrix = transform.match(/^matrix\((.+)\)$/);
        if (matrix) {
            const values = matrix[1].split(', ');
            return parseFloat(values[5]);
        }
        
        const translateY = transform.match(/translateY\(([^)]+)\)/);
        if (translateY) {
            return parseFloat(translateY[1]);
        }
        
        const translate = transform.match(/translate\(([^)]+)\)/);
        if (translate) {
            const values = translate[1].split(', ');
            return parseFloat(values[1] || 0);
        }
        return 0;
    }                                        

    function handleTouchMove(evt) {
        if (!isHide){
            if (! yDown ) {
                return;
            } 
                                                
            var yUp = touchDetect(evt);
            yDiff = yDown - yUp;
            
            var cord = initY-yDiff
            var maxCord = ($( window ).height()-$( "#includeProduct" ).height())
            if(maxCord>0){
                maxCord = 0
            }
            if(cord >  maxCord){
                if ( yDiff > 0 ) {
                    productCont.style.transform = `translateY(${cord}px)`;
                    
                } else {  
                    productCont.style.transform = `translateY(${cord}px)`;   
                } 
            }
        }                                                
    };
    
}





initPage()
initSlidePanel()




