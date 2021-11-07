import React,{Component} from 'react';
import Particles from "react-tsparticles";
import './App.css';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';


const app = new Clarifai.App({
    apiKey : "a1841d79744941529c69ce446c413e73"
});

const particles_options = {
    fpsLimit: 60,
    interactivity: {
        events: {
            onClick: {
                enable: true,
                mode: "push",
            },
            onHover: {
                enable: false,
                mode: "repulse",
            },
            resize: true,
        },
        modes: {
            bubble: {
                distance: 400,
                duration: 2,
                opacity: 0.8,
                size: 40,
            },
            push: {
                quantity: 4,
            },
            repulse: {
                distance: 200,
                duration: 0.4,
            },
        },
    },
    particles: {
        color: {
            value: "#ffffff",
        },
        links: {
            color: "#ffffff",
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
        },
        collisions: {
            enable: true,
        },
        move: {
            direction: "none",
            enable: true,
            outMode: "bounce",
            random: false,
            speed: 1,
            straight: false,
        },
        number: {
            density: {
                enable: true,
                value_area: 800,
            },
            value: 100,
        },
        opacity: {
            value: 0.5,
        },
        shape: {
            type: "circle",
        },
        size: {
            random: true,
            value: 3,
        },
    },
    detectRetina: true,
}

class App extends Component { 
    constructor() {
        super();
        this.state = {
            input :'',
            imageUrl: '',
            box: {},
            route: 'signin',
            isSignedIn: false,
            user: {
                id: '',
                name: '',
                email: '',
                entries: 0,
                joined: ''
            }
        };
    }

    loadUser = (data) => {
        this.setState({user: {
            id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined
        }})
    }
    
    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        console.log(width,height);
        return {
            leftCol: clarifaiFace.left_col * width ,
            topRow: clarifaiFace.top_row * height ,
            rightCol: width - (clarifaiFace.right_col * width) ,
            bottomRow: height - (clarifaiFace.bottom_row * height) ,
        }
    }

    displayFaceBox = (box) => {

        this.setState({box:box});
    }

    onInputChange = (event) => {
        this.setState({input:event.target.value})
    }
    
    onButtonSubmit = (event) => {

        this.setState({imageUrl:this.state.input})

        app.models.predict(Clarifai.FACE_DETECT_MODEL,this.state.input)
            .then(response => {
                if (response) {
                    fetch('http://localhost:3000/image',{
                        method: 'put',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id: this.state.user.id
                        })
                    })
                    .then(response => response.json())
                    .then(count => {
                        this.setState(Object.assign(this.state.user, {entries:count}))
                    })
                }
                

                this.displayFaceBox(this.calculateFaceLocation(response))})
            .catch(err => console.log(err));     
    }

    onRouteChange = (route) => {
        if (route==='signout') {
            this.setState({isSignedIn:false})
        }
        else if (route==='home'){
            this.setState({isSignedIn:true})
        }
        this.setState({route:route});
    }

    render() {
        const {isSignedIn , imageUrl , route , box } = this.state;

        return (
            <div className="App">
                <Particles
                    id="tsparticles"
                    options={particles_options}
                />
                <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
                { route === 'home'
                    ? <div>
                        <Logo />
                        <Rank name={this.state.user.name} entries={this.state.user.entries}  />
                        <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
                        <FaceRecognition box={box} imageUrl={imageUrl} />
                    </div>
                    : (
                        (route === 'signin' | route === 'signout')
                        ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                        : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                    )
                }
            </div>
        );
    }
  
}

export default App;
