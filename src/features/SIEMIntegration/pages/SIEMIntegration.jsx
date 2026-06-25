import React from 'react'
import logo from "../../../assets/LumiSecLogoB 1@3x.png"
import  "./SIEMIntegration.css"
import "../../../styles/global.css"

export default function SIEMIntegration() {
    return <>
    <div className='login-body pb-5'>
        <div className='container'>
        <div className='row vh-100 d-flex justify-content-center align-items-center'>
            <div className='col-12 col-lg-6'>
                <div className='d-flex align-items-center'>
                    <figure className='me-3 w-25'>
                        <img src={logo} className='w-100' alt="logo" />
                    </figure>
                    <div>
                        <h1 className='text-purple'>LumiSec</h1>
                        <p className='text-secondary'>Dark Web Email Breach & Threat Platform.</p>
                    </div>
                </div>
                <h2 className='colred-text w-35 mb-2'>SIEM Integration</h2>
                <p className='text-secondary w-50 mb-5'>Connect your SIEM vendor to LumiSec. Fill the information and test the integration.</p>
                <div className='rounded-3 p-3 dark-background'>
                    <h3 className='text-purple'>Integration checklist</h3>
                    <ul>
                        <li className='text-secondary'>Protocol, Host/IP, and Port must be reachable from LumiSec ingestion points.</li>
                        <li className='text-secondary'>Use HTTPS where possible.</li>
                        <li className='text-secondary'>Store API keys securely in your server vault.</li>
                    </ul>
                </div>
            </div>
            <div className='col-12 col-lg-6'>
                <div className='login-form rounded-4 p-3 py-4 form-background'>
                        <div className='d-flex justify-content-between align-align-items-center'>
                            <div className='d-flex justify-content-between align-items-center'>
                                <h3 className='text-white'>Connect & Test</h3>
                        </div>
                            <p className='mb-0 d-flex align-items-center Idle rounded-5'>Idle</p>
                        </div>
                    <form action="">
                        <div className='mb-4'>
                            <label className='text-secondary mb-1' htmlFor="Protocol">Protocol</label>
                            <input className='form-control input-field rounded-3 border-0 mb-3' type="Protocol" id='Protocol' value='HTTPS' />
                        </div>

                        <div className='row justify-content-between align-items-center'>
                            <div className="col-9 mb-1">
                                <label htmlFor="Host">
                                    Host / IP
                                </label>
                            </div>
                            <div className="col-3 mb-1">
                                <label htmlFor="Port">
                                    Port
                                </label>
                            </div>
                        </div>



                        <div className='row justify-content-between align-items-center mb-4'>
                                <div className='col-9 d-flex'>
                                    <i class="fa-solid fa-server position-relative server-icon text-white"></i>
                                    <input className='position-relative siem-local-input form-control header-search-input input-field border-0 me-3 ps-5 mb-0' type="text" value='siem.local or 10.0.0.5' name="" id="Host" />
                                </div>
                            <div className='col-3'>
                                <input className='form-control input-field border-0' type="text" value='443' name="" id="Port" />
                            </div>
                        </div>
                        

                        <div className='mb-4'>
                            <label className='text-secondary mb-1' htmlFor="Endpoint">Endpoint (optional)</label>
                            <div className='d-flex justify-content-between align-items-center'>
                                    <i class="fa-solid fa-link position-relative link-icon text-white"></i>
                                    <input className='position-relative siem-local-input form-control header-search-input input-field border-0 me-3 ps-5 mb-0' type="text" value='https://siem.example.com/api/collect' name="" id="Endpoint" />
                            </div>   
                        </div>



                        <div className='mb-4 Format-container'>
                            <label className='text-secondary mb-1' htmlFor="Format">Format</label>
                                <input className='position-relative siem-local-input form-control header-search-input input-field border-0 mx-3 ps-5 mb-0' type="text" value='JSON' name="" id="Format" />
                        </div>


                        <div className='mb-4'>
                            <label className='text-secondary mb-1' htmlFor="APIKey">API Key / Token</label>
                            <div className='d-flex'>
                                    <i class="fa-solid fa-key position-relative server-icon text-white"></i>
                                    <input className='position-relative siem-local-input form-control header-search-input input-field border-0 me-3 ps-5 mb-0' type="text" placeholder='Paste API key' name="" id="APIKey" />
                            </div>   
                        </div>

                        <div className='row justify-content-between align-items-center'>
                            <div className="col-8">
                                <button className='btn connect-btn w-100 text-white rounded-3'>Connect & Test</button>
                            </div>
                            <div className="col text-center">
                                <button className='btn px-3 seim-save-btn text-white rounded-3'>Save</button>
                            </div>
                            <div className="col text-center">
                                <button className='btn px-3 seim-reset-btn text-white rounded-3'>Reset</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    </div>
    </>
}
