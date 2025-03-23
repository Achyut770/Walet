import React from "react";

const Features = () => {
  return (
    <section className="features pos-rel pb-150 mb-0-pb">
      <div className="container">
        <div className="sec-title text-center mb-95">
          <h5 className="sec-title__subtitle">WHY CHOOSE US</h5>
          <h2 className="sec-title__title mb-25">Why choose our token?</h2>
        </div>
        
        <div className="feature__wra[ pos-rel ul_li_between">
          <div className="feature__item text-center">
            <div className="icon">
              <img src="assets/img/icon/f_01.svg" alt="" />
            </div>

            <h4>
              Cutting-Edge <br />
              Innovation
            </h4>
          </div>
          <div className="feature__item text-center">
            <div className="icon">
              <img src="assets/img/icon/f_02.svg" alt="" />
            </div>

            <h4>
              Long-term Growth <br />
              Potential
            </h4>
          </div>
          <div className="feature__item text-center">
            <div className="icon">
              <img src="assets/img/icon/f_03.svg" alt="" />
            </div>

            <h4>
            Earn Exclusive <br />
              Rewards
            </h4>
          </div>
          <div className="feature__item text-center">
            <div className="icon">
              <img src="assets/img/icon/f_04.svg" alt="" />
            </div>

            <h4>
              Secure and Private <br />
              Transactions
            </h4>
          </div>

          <div className="feature__line-shape">
            <img src="assets/img/shape/f_shape.png" alt="" />
          </div>
        </div>
      </div>

      <div className="feature__sec-shape">
        <img src="assets/img/shape/s_shape1.png" />
      </div>
    </section>
  );
};

export default Features;
