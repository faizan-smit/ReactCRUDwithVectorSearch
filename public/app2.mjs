

  var signup = document.getElementById('signup')

  signup.addEventListener('click', function(){

    var email = document.getElementById('email').value
    var password = document.getElementById('password').value
    var firstName = document.getElementById('firstName').value
    var lastName = document.getElementById('lastName').value

    axios.post('/api/v1/signup', {email: email, password: password, firstName: firstName, lastName: lastName})
    .then((res)=>{
      console.log('Done!: ' + res.data)
    })

    .catch((err)=>{
      console.log('error: ' + err)
    })
 


  })




  axios.post('/api/v1/authenticate')
  .then((response) => {

    if(response.data.success === true) {
      location.href = "/app.html";
    }

  })
  .catch((err) => {

    console.log(err);

  });


