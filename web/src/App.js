// import logo from './logo.svg';
import './App.css';
import PostForm from './components/crudform';
import Navbar from './components/navbar';
import {AllPosts} from './components/postrender';

function App() {
  return (

    <>

      <Navbar />

      <PostForm />

      <AllPosts />


    </>
    
  );
}

export default App;
