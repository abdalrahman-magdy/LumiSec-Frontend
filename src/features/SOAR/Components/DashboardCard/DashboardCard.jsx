import React from 'react'
import "./DashboardCard.css"

export default function DashboardCard({icon , title , Statistics , arrow , arrowDirection , text1 , desc1 , text2 }) {
const handleMouseMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
    card.style.setProperty("--rotate-x", `${rotateX}deg`);
    card.style.setProperty("--rotate-y", `${rotateY}deg`);
}

const handleMouseLeave = (event) => {
    const card = event.currentTarget;
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
}

return<>
    
    <div className='col-12 col-sm-6 col-xl'>

        <div
            className='rounded-4 dashboard-card dashboard-card-animated p-3 py-4 h-100'
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >

            <div className='d-flex align-items-center mb-2'>
                <i className='me-2'>{icon}</i>
                <p className='mb-0'>{title}</p>
            </div>

            <div className='overflow-hidden'>

                <h4 className='Statistics text-white mb-1'>
                    <span>{Statistics}</span>
                </h4>

                <div className='d-flex align-items-center'> 
                    <i>{arrow}</i>
                    <p className='text m-0'>
                        <span className={`${arrowDirection} me-1`}>{text1}</span>{desc1}
                    </p>
                </div>

                <p className='text mb-2 ms-0'>
                    {text2}
                </p>

            </div>

        </div>

    </div>

</>
}
