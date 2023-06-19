// add handle
$(function() {
    // select "car_v1c" as default
    $("#inlineRadio1").attr("checked", "checked");

    // database form change
    $('input[name=radio_dbe]').change(function() {
        console.log("input radio_dbe change");
        ajaxExe();
    });

    // update exemplar image
    $("#form_exe").ready(function(){
        console.log("form_exe is ready");
        ajaxExe();
    });

    // choose exemplar image
    $("#butSubExe").click(function(event){
        event.preventDefault();
        $('#butSubExe').blur();
        console.log("butSubExe is clicked");
        var imgUrl = $("img.selectedImage").attr("src");
        var nm = $("input[name=radio_dbe]:checked").val();
        ajaxSubExe(imgUrl, nm);
    });

    // url form submit
    $("#form_url").submit(function(event) {
        event.preventDefault();
        $('#butSubUrl').blur();
        console.log("form_url submit");
        ajaxSub();
    });

    // file form submit
    $("#form_file").submit(function(event) {
        event.preventDefault();
        console.log("form_file submit");
        processfile();
    });

    // file form style
    $("#input_file").filestyle({
        buttonText: "Upload / Capture",
        icon:false,
        buttonBefore: true,
        size: "lg"
    });

    // upload image to the server
    $("#input_file").change(function(event) {
        console.log("#input_file change");
        $("#form_file").submit();
    });

    // out exe image masonry
    var $container = $('#out_exe_tr');
    $container.imagesLoaded(function(){
        $container.masonry({
            itemSelector: '.out_exe_item'
        });
    });

    // fix image position
    // var out_img_head_pos = $('#out_img_head').offset();
    var out_img_pos = $('#out_img').offset();
    // var out_exe_tr_head_pos = 970;
    $(window).scroll(function() {
        if (window.innerWidth < 740) {
            $('#out_img').css('position', 'relative');
        } else {
            var currTop = $(window).scrollTop();
            if (currTop > out_img_pos.top - 20) {
                $('#out_img').css('position', 'fixed').css('top', '20px').css('width', $('#out_img_div').width() + 'px');
            } else {
                $('#out_img').css('position', 'static');
            }
        }
    });

    document.addEventListener('touchmove', function() {
        if (window.innerWidth < 740) {
            $('#out_img').css('position', 'relative');
        } else {
            var currTop = $(window).scrollTop();
            if (currTop > out_img_pos.top - 20) {
                $('#out_img').css('position', 'fixed').css('top', '20px').css('width', $('#out_img_div').width() + 'px');
            } else {
                $('#out_img').css('position', 'static');
            }
        }
    });
});

// Ajax function for change the database.
function ajaxExe() {
    // url
    var urlOri = window.location.href;
    var urlNew;
    if (urlOri.charAt(urlOri.length - 1) == '/') {
        urlNew = urlOri + 'exe';
    } else {
        urlNew = urlOri + '/exe';
    }

    // data
    var formDat = new FormData();
    var nm = $("input[name=radio_dbe]:checked").val();
    formDat.append("dbe", nm);

    // change score head
    if (nm.startsWith('car')) {
        document.getElementById('att_score_head').innerHTML = 'Predicted Shape';
    } else if (nm.startsWith('food_v5')) {
        document.getElementById('att_score_head').innerHTML = 'Predicted Type';
    } else if (nm.startsWith('food_v6')) {
        document.getElementById('att_score_head').innerHTML = 'Predicted Ingredient';
    } else if (nm.startsWith('bird')) {
        document.getElementById('att_score_head').innerHTML = 'Predicted Attribute';
    }

    // call ajax
    $.ajax({
        type: "POST",
        url: urlNew,
        data: formDat,
        processData: false,
        contentType: false,
        success: function(json) {
            // update input exemplar in #form_exe
            shInExe(json);

            // hide output
            hiOutAll();
        }
    });
}

// Ajax function for clicking an exemplar image.
function ajaxSubExe(link, nm) {
    console.log(link);

    // url
    var urlOri = window.location.href;
    var urlNew;
    if (urlOri.charAt(urlOri.length - 1) == '/') {
        urlNew = urlOri + 'sub';
    } else {
        urlNew = urlOri + '/sub';
    }

    // data
    var formDat = new FormData();
    formDat.append("fn", link);
    formDat.append("nm", nm);

    // call ajax
    $.ajax({
        type: "POST",
        url: urlNew,
        data: formDat,
        processData: false,
        contentType: false,
        success: function(json) {
            // show all
            hiOutAll();
            shOutAll();

            // update img in #input
            shOutImg(json.img);

            // update score in #score
            shOutScoHead();
            shOutSco(json.result, "score");
            shOutSco(json.resultH, "score2");
            shOutExeTr(json.prefix, json.trExes);
        }
    });
}

// Ajax function for submit file or url.
function ajaxSub() {
    // url
    var urlOri = window.location.href;
    var urlNew;

    if (urlOri.charAt(urlOri.length - 1) == '/') {
        urlNew = urlOri + 'sub';
    } else {
        urlNew = urlOri + '/sub';
    }

    // data
    var formDat = new FormData();
    formDat.append("file", $("#input_file")[0].files[0]);
    var val = $("#input_text").val();
    formDat.append("url", val);
    var nm = $("input[name=radio_dbe]:checked").val();
    formDat.append("nm", nm);
    formDat.append("image", $("#image_input").val());

    // call ajax
    $.ajax({
        type: "POST",
        url: urlNew,
        data: formDat,
        processData: false,
        contentType: false,
        success: function(json) {
            hiOutAll();
            shOutAll();

            // update img in #input
            shOutImg(json.img);

            // update score in #score
            // shOutScoHead();
            // hiOutSco("score");
            // hiOutSco("score2");
            // hiOutExeTr();
            shOutSco(json.result, "score");
            shOutSco(json.resultH, "score2");
            shOutExeTr(json.prefix, json.trExes);

            // clear image_input
            $("#image_input").val("");
        }
    });
}

// show input exemplar in #form_exe
function shInExe(json) {
    console.log("shInExe");

    // json element
    prefix = json.prefix;
    result = json.result;
    nm = json.nm;

    for (c = 0; c < 16; ++c) {
        var imgNm = "#in_exe_" + c;
        var imgUrl = prefix + result[c];
        $(imgNm).attr("src", imgUrl);
    }

    var n = $("#tmp #form_exe *"),
        t = parseInt(n.css("margin-left").replace("px", "")) || 0,
        i = parseInt(n.css("margin-right").replace("px", "")) || 0,
        r = n[0].offsetWidth,
        u = (r + t + i) * n.length;

    $("#tmp #form_exe").css("width", u + "px");

    if (typeof myScroll == 'undefined') {
        myScroll = new IScroll("#tmp", {
            scrollX: !0,
            scrollY: !1,
            mouseWheel: !0,
            snap: "*",
            momentum: !0,
            tap: !0,
            scrollbars: !1,
            deceleration: .002,
            bounce: !1
        });
    }

    // start at center
    myScroll.goToPage((n.length / 2).toFixed(0) - 1, 0, 0, !1);

    $("#tmp #form_exe *").on("tap", function() {
        if (myScroll.currentPage.pageX != $(this).index()) {
            $("#tmp .selectedImage").removeClass("selectedImage");
            myScroll.goToPage($(this).index(), 0, 400);
            updateSelectedImage();
        }
    });
    myScroll.on("flick", function() {
        this.x == this.startX && updateSelectedImage();
    });
    myScroll.on("scrollEnd", updateSelectedImage);
    myScroll.on("scrollStart", function() {
        $("#tmp #form_exe .selectedImage").removeClass("selectedImage");
    });

    updateSelectedImage();
}

function updateSelectedImage() {
    selectedImage = $("#tmp #form_exe *")[myScroll.currentPage.pageX];
    selectedImage && (selectedImage.className = "selectedImage");
}

// hide output all
function hiOutAll() {
    console.log("hiOutAll");
    $("#container_out").hide();

    hiOutSco('score');
    hiOutSco('score2');
}

// show output all
function shOutAll() {
    console.log("shOutAll");
    $("#container_out").show();
}

// show output image
function shOutImg(imgSrc) {
    console.log("shOutImg");

    $("#out_img").attr("src", imgSrc);
    $("#out_img").show();
}

// hide output image
function hiOutImg() {
    console.log("hiOutImg");
    $("#out_img").hide();
}

// show output image
function shOutScoHead() {
    console.log("shOutScoHead");
    $(".score_head").show();
}

// hide output image
function hiOutScoHead() {
    console.log("hiOutScoHead");
    $(".score_head").hide();
}

// plot exemplar in the div #exe_img_div
function shOutExeTr(prefix, result) {
    console.log("shOutExeTr");

    var imgCount = result.length;
    console.log("imgCount: " + imgCount);
    for (c = 0; c < result.length; ++c) {
        $("#out_exe_tr_" + c).attr("src", prefix + result[c]);
        $("#out_exe_tr_" + c).show();
        $("#out_exe_tr_" + c).load(function() {
            imgCount--;
            if (imgCount == 0) {
                console.log("img all loaded");
                $("#out_exe_tr").masonry('layout');
            }
        });
    }
}

// show output image
function shOutExeTrHead() {
    console.log("shOutExeTrHead");
    $("#out_exe_tr_head").show();
}

// hide output exe tr head
function hiOutExeTrHead() {
    console.log("hiOutExeTrHead");
    $("#out_exe_tr_head").hide();
}

// hide output image
function hiOutExeTr() {
    console.log("hiOutExeTr");
    for (c = 0; c < 16; ++c) {
        $("#out_exe_tr_" + c).hide();
    }
}

// plot result in the div #score
function shOutSco(result, name) {
    console.log("shOutSco: " + name);

    // width and height
    var w = 500;
    var h = 200;
    var barPadding = 1;

    // parse result
    nTop = result.length;
    var scos = [], cNms = [], scoMa = result[0].score;
    for (i = 0; i < nTop; i++) {
        scos[i] = result[i].score * 100;
        cNms[i] = result[i].classid;
    }

    // create SVG element
    var svg = d3.select("#" + name)
            .append("svg")
            .attr("width", "100%")
            .attr("height", h);

    // show rect
    svg.selectAll("rect")
        .data(scos)
        .enter()
        .append("rect")
        .attr("y", function(d, i) {
            return i * (h / nTop);
        })
        .attr("x", function(d) {
            return 0;
        })
        .attr("height", h / nTop - barPadding)
        .attr("width", function(d) {
            return d + "%";
        });

    // show text
    svg.selectAll("text")
        .data(cNms)
        .enter()
        .append("text")
        .text(function(d) {
            return d;
        })
        .attr("text-anchor", "start")
        .attr("y", function(d, i) {
            return i * (h / nTop) + (h / nTop - barPadding) / 2 + 18 / 3;
        })
        .attr("x", function(d) {
            return 5;
        });
}

// hide output image
function hiOutSco(name) {
    console.log("hiOutSco: " + name);

    // remove the old one
    if ($("#" + name + " svg").length) {
        $("#" + name + " svg").remove();
    }
}

function processfile() {
    var fileinput = document.getElementById('input_file');
    var max_width = fileinput.getAttribute('data-maxwidth');
    var max_height = fileinput.getAttribute('data-maxheight');
    file = fileinput.files[0];
    if (!( /image/i ).test(file.type)) {
        alert("File " + file.name + " is not an image.");
        return false;
    }

    var form = document.getElementById('form_file');
    // read the files
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function(event) {
        // blob stuff
        var blob = new Blob([event.target.result]); // create blob...
        window.URL = window.URL || window.webkitURL;
        var blobURL = window.URL.createObjectURL(blob); // and get it's URL

        var image = new Image();
        image.src = blobURL;
        image.onload = function() {
            // have to wait till it's loaded
            var resized = resizeMe(image, max_width, max_height); // send it to canvas
            // var resized = image;
            var newinput = document.getElementById("image_input");
            newinput.value = resized;
            fileinput.value = '';
            ajaxSub();
        };
    };

    return true;
}

// this is where it starts. event triggered when user selects files
function file_onchange() {
    if ( !( window.File && window.FileReader && window.FileList && window.Blob ) ) {
        var form = document.getElementById('form_file');
        form.submit();
        return false;
    }
    processfile();
}

// resize image
function resizeMe(img, max_width, max_height) {
    var canvas = document.createElement('canvas');

    var width = img.width;
    var height = img.height;
    console.log("width: %d height %d", width, height);

    // calculate the width and height, constraining the proportions
    if (width > height) {
        if (width > max_width) {
            //height *= max_width / width;
            height = Math.round(height *= max_width / width);
            width = max_width;
        }
    } else {
        if (height > max_height) {
            //width *= max_height / height;
            width = Math.round(width *= max_height / height);
            height = max_height;
        }
    }

    // resize the canvas and draw the image data into it
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.7); // get the data from canvas as 70% JPG (can be also PNG, etc.)
}
