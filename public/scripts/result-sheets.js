$("#generate-result-sheet")[0].addEventListener('click',()=>{
      $.post("/admin/result/sheet/generate",{
            held:$('#admin-result-sheet-held').val(),
            year:$('#admin-result-sheet-year').val(),
            semester:$('#admin-result-sheet-semester').val(),
            combination:$('#combination').val()
      },(data)=>{
            $("#admin-result-sheet-mid").html(data);
      });
});