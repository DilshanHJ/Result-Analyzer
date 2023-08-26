/////////////////////////////////////////////user main page /////////////////////////////////////////////////

for (let i = 1; i<5; i++) {
      $(".user-nav-menu-item")[i].addEventListener('click',()=>{
            for (let j=0; j<=5;j++){
                  $(".user-nav-menu-item")[j].classList.remove("user-nav-menu-item-selected");
                  $(".user-nav-menu-item")[j].classList.remove("user-nav-menu-item-befor-selected");
                  $(".user-nav-menu-item")[j].classList.remove("user-nav-menu-item-after-selected");
            }

            $(".user-nav-menu-item")[i-1].classList.add("user-nav-menu-item-befor-selected");
            $(".user-nav-menu-item")[i].classList.add("user-nav-menu-item-selected");
            $(".user-nav-menu-item")[i+1].classList.add("user-nav-menu-item-after-selected");

      });
}



$("#user-menu-button")[0].addEventListener('click',()=>{
      $("#user-nav-menu-container").slideToggle("slow");
});



$(".user-nav-menu-item")[1].addEventListener('click',()=>{
      $.get("/user-home/my-results",(data)=>{
            $("#user-main-body").html(data);
      });
});


$(".user-nav-menu-item")[2].addEventListener('click',()=>{
      $.get("/user-home/results-sheets",(data)=>{
            $("#user-main-body").html(data);
      });
});


$(".user-nav-menu-item")[3].addEventListener('click',()=>{
      $.get("/user-home/gpa-lists",(data)=>{
            $("#user-main-body").html(data);
      });
});


$(".user-nav-menu-item")[4].addEventListener('click',()=>{
      $.get("/user-home/my-profile",(data)=>{
            $("#user-main-body").html(data);
      });
});