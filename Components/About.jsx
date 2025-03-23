import React from "react";

const About = () => {
  return (
    <section id="about" className="about pos-rel pb-140">
      <div className="container">
        <div className="row align-items-center mt-none-30">
          <div className="col-lg-6 mt-30">
            <div className="about__img pos-rel wow fadeInLeft">
              
              <div className="about__shape">
               <img src="assets/img/shape/meta_logo.png" alt="" width="500" height="200" /> 
              </div> 
            </div>
          </div>
          <div className="col-lg-6 mt-30">
          <div 
          className="about__content wow fadeInRight"
          data-wow-delay="100ms"
          >
           <div className="sec-title mb-35">
            <h5 className="sec-title__subtitle">WHAT is Meta Frost</h5>
            <h2 className="sec-title__title mb-25" style={{ fontSize: "18px", lineHeight: "1.4", 
            wordSpacing: "2px" }} >
            At Meta Frost, we are on a mission to redefine the Virtual Reality (VR) landscape by creating immersive and transformative experiences that revolutionize how people live, work, learn, and connect. Our vision is fueled by innovation, creativity, and the belief that VR has the power to shape the future of human interaction.                          
            </h2>
            <p>
            As technology evolves, so does our commitment to delivering cutting-edge solutions. By leveraging advancements in VR hardware, enhanced realism, and AI-driven interactions, we are crafting virtual environments that feel more authentic and engaging than ever before. From immersive entertainment to collaborative workspaces, educational platforms, and social hubs, Meta Frost is paving the way for a new era of possibilities.
            The Meta Frost Token is more than just a cryptocurrency; it is the foundation of our entire ecosystem. By participating in the Meta Frost Token presale, you become part of a groundbreaking project at the forefront of VR and blockchain innovation. 
            Be part of the Meta Frost revolution during the Meta Frost Token presale 2025! This is your opportunity to invest in the most innovative Project.
             
            </p>
           </div>

           <ul className="about__list ul_li">
            <li>
              <img src="assets/img/icon/a_arrow.svg" alt="" />
              Decentralized Platform
            </li>
            <li>
              <img src="assets/img/icon/a_arrow.svg" alt="" />
              Reward Mechanism
            </li>
            <li>
              <img src="assets/img/icon/a_arrow.svg" alt="" />
              Crowd Wisdom
            </li>
            <li>
              <img src="assets/img/icon/a_arrow.svg" alt="" />
              Investor Protection
            </li>
            <li>
              <img src="assets/img/icon/a_arrow.svg" alt="" />
              Token Sale Phases
            </li>
            <li>
              <img src="assets/img/icon/a_arrow.svg" alt="" />
              Exchange Listing
            </li>
           </ul>
          </div>
        </div>
        </div>        
      </div>

      <div className="about__sec-shape">
        <img src="assets/img/shape/h_shape3.png" alt="" />
      </div>
    </section>
  );
};

export default About;
