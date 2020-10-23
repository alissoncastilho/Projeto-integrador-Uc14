var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'My App',
    // App id
    id: 'com.myapp.test',
    // Enable swipe panel
    panel: {
      swipe: 'left',
    },
    // Add default routes
    routes: [
      {
        name: 'home',
        path: '/home/',
        url: 'index.html?a=7',
        on:{
          pageInit:function(){
            pageIndex();
          },
        },
      }, {
        path: '/configuracoes/',
        url: 'configuracoes.html?y=p',
    },{
        path: '/servico',
        url: 'servico.html?a=b',
        on:{
          pageInit:function(){
            pageTarefas();
          },
        },
      },{
        path: '/servico2',
        url: 'servico2.html?a=b',
       
          },
        
       ,  {
        path: '/cadastro/',
        url: 'cadastro.html?a=b',
        on:{
          pageInit:function(){
            pageCadastro();
          },
        },
      },    {
        name: 'login',
        path: '/login/',
        url: 'login.html?a=7',
        on:{
          pageInit:function(){
          pageLogin();
          },
        },
      }
    ],
    // ... other parameters
  });
  var mainView = app.views.create('.view-main');

  if(window.openDatabase){
    // Criando banco de dados
    db = openDatabase("DB_AGENDA","0.1","Base de dados local", 5*1021*1024);

    // Criando tabela tarefas
    db.transaction(function(query){
      query.executeSql("CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, descricao TEXT, data TEXT)");
      query.executeSql("CREATE TABLE IF NOT EXISTS servico (id INTEGER PRIMARY KEY AUTOINCREMENT, hora TEXT, valor TEXT, telefone TEXT)");
      // Gravando configurações
      query.executeSql("CREATE TABLE IF NOT EXISTS config (id INTEGER PRIMARY KEY AUTOINCREMENT, theme INTEGER)");  // INTEGER = Inteiro
    
      query.executeSql("SELECT theme FROM config",[],function(query,result){
        linha = result.rows.length;
        //alert(linha);
        if(linha == 0){
          query.executeSql("INSERT INTO config (theme) VALUES (1)",[]);
        }
      });
    });
  }

  var swiper = app.swiper.get('.swiper-container'); //inicializando
// //animação do popup -poupape
var popup = app.popup.open(".popup-inicial"); 

const cod_usuario = localStorage.getItem("id_usuario_prefeitura");

setTimeout(function(){
 var popupClose = app.popup.close(".popup-inicial", true);
 }, 3000); //3000 = padrão de tempo


  // Inicializando o JS
function pageIndex(){
  $(document).ready(function(){
    db.transaction(function(query){
       query.executeSql("SELECT theme FROM config",[],function(query,result){
         linha = result.rows;
         for(var i=0; i < linha.length; i++){
           result_theme = linha[i].theme;
         }
         if(result_theme == 0){
           $(".bg").toggleClass("theme-dark");
           $(".panel").toggleClass("panel2");
           $('input[type="checkbox"]').prop('checked', true);
         }
       });
     });
 
     // Capturando data atual
     now = new Date;
     dias = new Array("Domingo","Segunda","terça","Quarta","Quinta","Sexta","Sábado");
     meses = new Array("Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez");
     $(".data-atual").html(dias[now.getDay()]+", "+now.getDate()+" de "+meses[now.getMonth()]+" de "+ now.getFullYear());
     // alert(now);
 
     // Função modo noturno
     $(".btn-noturno").click(function(){
       db.transaction(function(query){
         if(result_theme == 1){
           db.transaction(function(query){
             query.executeSql("UPDATE config SET theme = 0",[]);
           });
         }else{
           db.transaction(function(query){
             query.executeSql("UPDATE config SET theme = 1",[]);
           });
         }
       });
       $(".bg").toggleClass("theme-dark");
       $(".panel").toggleClass("panel2");
     });
 
     mostrarDados();
 
     /* Botao exluir atrasadas */
     $('.open-confirm').on('click', function () {
       app.dialog.confirm('Deseja exluir todas os clientes de ontem ?', function () {
         app.dialog.alert('Feito!');
         mostrarDados();
       });
     });
 
    day = ("0" + now.getDate()).slice(-2);
    month = ("0" + (now.getMonth() + 1)).slice(-2);
    today = now.getFullYear()+"-"+(month)+"-"+(day);
 
 }); // FIM document page index
}  

// Funções de escopo global
function mostrarDados(){
  dados = "";
text = "";
// Executar consulta SQL
  db.transaction(function(query){
    query.executeSql("SELECT * FROM tarefas ORDER BY data ASC",[],function(query,result){     // [] = array
      linha = result.rows;

      for(var i = 0; i < linha.length; i++){
        inicial = linha[i].titulo.substring(0,1);   // Primeira letra 
        dataF = linha[i].data;    // formatando a data
        split = dataF.split('-');
        novaData = split[2]+"/"+split[1]+"/"+split[0];
        
         //alert(today);
        if(dataF < today){
          dados +='<li class="swipeout">';
            dados+='<div class="swipeout-content item-content bg-color-red color-text">';
                dados+='<div class="item-media color_c2"><span>'+inicial+'</span></div>';
                dados+='<div class="item-title atividade">'+linha[i].titulo.substring(0,30)+'</div>';
                dados+='<div class="item-left small">'+novaData+'</div>';
            dados+='</div>'; // FIM swipeout
            dados+='<div class="swipeout-actions-right">';
                dados+='<a href="#" class="swipeout-close" onclick="descricao('+linha[i].id+')"><i class="f7-icons">eye_fill</i>"</a>';
                dados+='<a href="#" class="swipeout-delete" onclick="deletar('+linha[i].id+')"><i class="f7-icons">trash</i></a>';
            dados+='</div>'; // FIM swipeout-actions
          dados+='</li>'; // FIM li
        }else{
          dados +='<li class="swipeout">';
            dados+='<div class="swipeout-content item-content">';
                dados+='<div class="item-media color_c"><span>'+inicial+'</span></div>';
                dados+='<div class="item-title atividade">'+linha[i].titulo.substring(0,30)+'</div>';
                dados+='<div class="item-left small">'+novaData+'</div>';
            dados+='</div>'; // FIM swipeout
            dados+='<div class="swipeout-actions-right">';
                dados+='<a href="#" class="swipeout-close" onclick="descricao('+linha[i].id+')"><i class="f7-icons">eye_fill</i>"</a>';
                dados+='<a href="#" class="swipeout-delete" onclick="deletar('+linha[i].id+')"><i class="f7-icons">trash</i></a>';
            dados+='</div>'; // FIM swipeout-actions
          dados+='</li>'; // FIM li
        }
        
      } // FIM for
      
      $("#list").html(dados);
    });
  });
  
}

// Mostra descrição
function descricao(id){
  desc = "";
  titulo = "";

  db.transaction(function(query){
    query.executeSql("SELECT titulo, descricao FROM tarefas WHERE id=?",[id],function(query,result){
      linha = result.rows;
      for(var i = 0; i < linha.length; i++){
        titulo+='<div class="item-title">'+linha[i].titulo+'</div>';
        desc+='<div class="item-content">'+linha[i].descricao+'</div>';
      }
      app.dialog.alert("Serviço solicitado"+desc,titulo);
    });
  });

  hor = "";
  val = "";
  tel = "";

  db.transaction(function(query){
    query.executeSql("SELECT hora,valor,telefone FROM servico WHERE id=?",[id],function(query,result){
      linha = result.rows;
      for(var i = 0; i < linha.length; i++){
        tel+='<div class="item-content">'+linha[i].telefone+'</div>';
        hor+='<div class="item-content">'+linha[i].hora+'</div>';
        val+='<div class="item-content">'+linha[i].valor+'</div>';
      }
      app.dialog.alert("Telefone de contato"+tel+"Horário"+hor+"Valor"+val,"Informações importantes");
    });
  });
}

// Remove tarefas atrasadas
function deletarAtrasadas(today){
  db.transaction(function(query){
    query.executeSql("DELETE FROM tarefas WHERE data<?",[today]);
    query.executeSql("DELETE FROM servico WHERE data<?",[today]);
  });
  var day = ("0" + now.getDate()).slice(-2);
  var month = ("0" + (now.getMonth() + 1)).slice(-2);
  var today = now.getFullYear()+"-"+(month)+"-"+(day);
    // alert(today);
}

// Remove tarefa
function deletar(id){
  db.transaction(function(query){
    query.executeSql("DELETE FROM tarefas WHERE id=?",[id]);
    query.executeSql("DELETE FROM servico WHERE id=?",[id]);
  });
}

// FIM escopo global

// Função page tarefas
function pageTarefas(){
  $(document).ready(function(){

    // var day = ("0" + now.getDate()).slice(-2);
    // var month = ("0" + (now.getMonth() + 1)).slice(-2);
    // var today = now.getFullYear()+"-"+(month)+"-"+(day);
    
    $("#dataTarefa").val(today);

    $('.btn-agendar').click(function(){
      var titulo = $("#titulo").val();
      var descricao = $("#descricao").val();
      var dataTarefa = $("#dataTarefa").val();
      var telefone = $("#telefone").val();
      var hora = $("#hora").val();
      var valor = $("#valor").val();

      if(titulo.length < 5 || titulo.trim() == ""){
        app.dialog.alert("Preencha o  Nome corretamente","AVISO");
        return false;
      }
      if(descricao.length > 100 || descricao.trim() == ""){
        app.dialog.alert("Preencha a descrição do serviço corretamente","AVISO");
        return false;
      }
      if(dataTarefa < today){
        app.dialog.alert("A data não pode ser retroativa","AVISO");
        $("#dataTarefa").val(today);
        return false;
      }
      // alert(titulo+" | "+descricao);

      if(telefone.length > 15 || telefone.trim() == ""){
        app.dialog.alert("Preencha o telefone corretamente","AVISO");
        return false;
      }
      if(hora.length > 5 || hora.trim() == ""){
        app.dialog.alert("Preencha a hora corretamente","AVISO");
        return false;
      }
      if(valor.length > 10 || valor.trim() == ""){
        app.dialog.alert("Preencha o valor total corretamente","AVISO");
        return false;
      }

      var notification = app.notification.create({
        title:'cadastro de cliente',
        text:'Cliente cadastrado com sucesso',
        closeTimeout:3000,
      });
      // Inserindo informações no banco
      db.transaction(function(query){
        query.executeSql("INSERT INTO tarefas (titulo,descricao,data) VALUES (?,?,?)",[titulo,descricao,dataTarefa]);
        notification.open();
        $("#titulo").val("");
        $("#descricao").val("");
        $("#dataTarefa").val(today);
      });

      db.transaction(function(query){
        query.executeSql("INSERT INTO servico (hora,valor,telefone) VALUES (?,?,?)",[hora,valor,telefone]);
        $("#hora").val("");
        $("#valor").val("");
        $("#telefone").val("");
      });

      mostrarDados();

    });
  });

$(".logout").on("click",function(){
  localStorage.removeItem('id_usuario_prefeitura');
  localStorage.removeItem('nome');
});
}

function pageLogin(){
$("#entrar").on('click', function(e){
  e.preventDefault();
  
  var nome = $("#nome").val();
  var senha = $("#senha").val();

  if(nome.trim() == "" || senha.trim() == ""){
    app.dialog.alert("Os campos usuário e senha são obrigatórios","AVISO");
    return false
  }

  // Requisição AJAX
  app.request({
    // url:"php/login.php",
    url:"https://www.limeiraweb.com.br/alisson/php/login_prefeitura.php",
    type:"POST",
    dataType:"json",
    data:$("#Formlogin").serialize(),
    success:function(data){
      if(data.resultado != 0){

        app.dialog.alert("Bem-Vindo "+data.nome,"AVISO");

        localStorage.setItem('id_usuario_prefeitura',data.id_usuario);
        localStorage.setItem('nome',data.nome);

        mainView.router.navigate({name:'home'});
        // window.location.href = "index.html";

      }else{
        app.dialog.alert("Usuário ou senha incorretos","AVISO");
      }

    },
    error:function(e){

    }
  });

});
}

function pageCadastro(){

$("#masc").on("click", function(){
  localStorage.setItem("sexo","Masculino");
});
$("#fem").on("click", function(){
  localStorage.setItem("sexo","Feminino");
});

$("#cadastrar").on('click',function(e){
  e.preventDefault();

  var sexo = localStorage.getItem("sexo");

  var nome_c = $("#nome_c").val();
  var email_c = $("#email_c").val();
  var senha_c = $("#senha_c").val();
  var data = $("#dataNascimento").val();

  if(nome_c.trim() == ""){
    app.dialog.alert("Verifique a informação digitada no campo nome","");
    return false;
  }
  if(email_c.trim() == ""){
    app.dialog.alert("Verifique a informação digitada no campo email","");
    return false;
  }
  if(senha_c.trim() == ""){
    app.dialog.alert("Verifique a informação digitada no campo senha","");
    return false;
  }
  if(dataNascimento == ""){
    app.dialog.alert("Verifique a informação digitada no campo Data de Nascimento","");
    return false;
  }

  // INSERT
  //app.request.post('php/insert_login.php',{
  app.request.post('https://www.limeiraweb.com.br/alisson/php/insert_login_prefeitura.php',{
    nome:nome_c,
    email:email_c,
    senha:senha_c,
    dataNascimento:data,
    genero:sexo,
  },
  function(data){
    if(data != "existe"){
      app.dialog.alert("Cadastro realizado com sucesso","");
    }else{
      app.dialog.alert("Este email já está em uso","");
    }

    localStorage.removeItem("sexo");

      $("#nome_c").val("");
      $("#email_c").val("");
      $("#senha_c").val("");
      $("#dataNascimento").val("");

  });

});

}

$(document).ready(function(){
  if(cod_usuario){
    pageIndex();
  }else{
    mainView.router.navigate({name:'login'});
    pageLogin();
  }
});

