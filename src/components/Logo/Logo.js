import React from "react";
import Tilt from 'react-tilty';
import './Logo.css';
import brain from './brain.png'

const Logo = () => {
    return (
        <div className='ma4 mt0'>
            <Tilt className="Tilt br5 shadow-2" options={{ max : 55 }} style={{ height: 100, width: 100 }} >
                <div className="Tilt-inner">
                    <img className="pv3" alt='logo' src={brain}/>
                </div>
            </Tilt>

        </div>
    );
}

export default Logo;