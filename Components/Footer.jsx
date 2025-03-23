import React from "react";
import {
  TiSocialFacebook, 
  TiSocialTwitter,
  TiSocialInstagram, 
 } from "react-icons/ti";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { IoCloudDownload } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";

const Footer = ()=> {
  return (
    <footer
    className="site-footer footer__ico pos-rel"
    data-background="assets/img/bg/footer_bg.png"
    >
      <div className="container">
        <div className="row mt-none-30">
          <div className="col-lg-4 mt-30">
            <div className="footer__widget footer__subscribe">
              <h2>Subscribe newsletter</h2>
              <p>
              "Be part of the journey! 
              Subscribe to our newsletter for real-time updates, exclusive insights, and the latest on the progress of our crypto token project".
              Enter your email address below to subscribe to our newsletter.
              </p>

              <form action="">
                <input 
                type="text"
                placeholder="Enter you email"
                />
                <button>
                  <IoIosSend />
                </button>
              </form>
            </div>
          </div>
          
          <div className="col-lg-8 mt-30">
            <div className="footer__widget text-lg-end">
              <h2>Download Document</h2>

              <div className="footer__document ul_li_right">
                <a href="#" className="footer__document-item text-center">
                  <div className="icon">
                    <img src="assets/img/icon/pdf.svg" alt="" srcset="" />
                  </div>
                  <span className="title">
                    <IoCloudDownload />
                    white paper
                  </span>
                </a>
                <a href="https://drive.google.com/uc?export=download&id=13PIP16duVZR-_UeadozGCbCuNiREiEx_
" className="footer__document-item text-center">
                  <div className="icon">
                    <img src="assets/img/icon/pdf.svg" alt="" srcset="" />
                  </div>
                  <span className="title">
                    <IoCloudDownload />
                    privacy policy
                  </span>
                </a>
               {/* <a href="#" className="footer__document-item text-center">
                  <div className="icon">
                    <img src="assets/img/icon/pdf.svg" alt="" srcset="" />
                  </div>
                  <span className="title">
                    <IoCloudDownload />
                    terms of sale
                  </span>
                </a> */} 
              </div>
            </div>
          </div>
        </div>

        <div className="footer__bottom ul_li_between mt-50">
          <div className="footer__logo mt-20">
            <a href="#">
            <img src="assets/img/shape/meta1.png" alt="" width="250" height="120" style={{ position: 'absolute', bottom: '0', left: '0', marginBottom: '-40px' }} srcset="" />
            </a>
          </div>      

        <ul className="footer__social ul_li mt-20">
          <li>
            <a href="#">
              <TiSocialFacebook />
            </a>
          </li>
          <li>
            <a href="https://x.com/MetaFrostWorld">
              <TiSocialTwitter />
            </a>
          </li>
         {/* <li>
            <a href="#">
              <TiSocialInstagram />
            </a>
          </li> */}   
          <li>
            <a href="https://t.me/MetaFrostOfficial">
              <FontAwesomeIcon icon={faTelegram} /> {/* Font Awesome Telegram icon */}
              </a>
           </li>   
               
        </ul>
       </div>
      </div>

      <div className="footer__copyright mt-80">
        <div className="container">
          <div className="footer__copyright-inner ul_li_between">
          <div className="footer__copyright-text mt-15">
            Copyright @2025 @LumaSpace. All rights reserved
            </div>

            <ul className="footer__links ul_li_right mt-15">
             {/*  <li>
                <a href="#">Privacy</a>
              </li>
             <li>
                <a href="#">Cookies</a>
              </li> */}
              <li>
                <a href="https://drive.google.com/uc?export=download&id=1387ztD6UyGGy58YLzBYgDHqVIdm7mMkt">Terms</a>
              </li>
              <li>                
                <a className="scrollspy-btn" href="#about">
                  About
                  </a>
                </li>
                <li>
                <a className="scrollspy-btn" href="#faq">
                  Faq
                  </a>
                </li>
              <li>
                <a className="scrollspy-btn" href="#contact">
                  Contact
                  </a>
                </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__icon-shape">
        <div className="icon icon--1">
          <div>
            
          </div>
        </div>

        <div className="icon icon--2">
          <div>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;