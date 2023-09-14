
  var signin = document.getElementById('signin')

  signin.addEventListener('click', async (event)=>{

    var email = document.getElementById('email').value
    var password = document.getElementById('password').value

    try{

    axios.post('/api/v1/login', {email: email, password: password})
    .then((res)=>{
      console.log('Done!: ' + res.data + " " + res.status);
      if (res.status === 200) {
        window.location.href = "/app.html";
    }
    })

    .catch((err)=>{
      console.log('error: ' + err)
    })
    
    // console.log(axiosRes)
 
    


  } catch (err) {

    console.log(err);


  }

  }
  


   
  );

  axios.post('/api/v1/authenticate')
  .then((response) => {

    if(response.data.success === true) {
      location.href = "/app.html";
    }

  })
  .catch((err) => {

    console.log("User not logged in");

  });

