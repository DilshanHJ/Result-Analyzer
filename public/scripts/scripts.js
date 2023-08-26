/////////////////////admin navbar scripts///////////////////////
for (let i = 1; i<5; i++) {
      $(".admin-nav-menu-item")[i].addEventListener('click',()=>{
            for (let j=0; j<=5;j++){
                  $(".admin-nav-menu-item")[j].classList.remove("admin-nav-menu-item-selected");
                  $(".admin-nav-menu-item")[j].classList.remove("admin-nav-menu-item-befor-selected");
                  $(".admin-nav-menu-item")[j].classList.remove("admin-nav-menu-item-after-selected");
            }

            $(".admin-nav-menu-item")[i-1].classList.add("admin-nav-menu-item-befor-selected");
            $(".admin-nav-menu-item")[i].classList.add("admin-nav-menu-item-selected");
            $(".admin-nav-menu-item")[i+1].classList.add("admin-nav-menu-item-after-selected");

      });
}



$("#admin-menu-button")[0].addEventListener('click',()=>{
      $("#admin-nav-menu-container").slideToggle("slow");
});



$(".admin-nav-menu-item")[1].addEventListener('click',()=>{
      $.get("/admin-home/enter-results",(data)=>{
            $("#admin-main-body").html(data);
      });
});


$(".admin-nav-menu-item")[2].addEventListener('click',()=>{
      $.get("/admin-home/results-sheets",(data)=>{
            $("#admin-main-body").html(data);
      });
});


$(".admin-nav-menu-item")[3].addEventListener('click',()=>{
      $.get("/admin-home/analyzed-reports",(data)=>{
            $("#admin-main-body").html(data);
      });
});


$(".admin-nav-menu-item")[4].addEventListener('click',()=>{
      $.get("/admin-home/add-new-users",(data)=>{
            $("#admin-main-body").html(data);
      });
});



