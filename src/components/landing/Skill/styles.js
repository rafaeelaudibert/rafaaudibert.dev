import styled from 'styled-components';

export const SkillWrapper = styled.div`
  .skill-progress {
    position: relative;
    margin-bottom: 15px;
  }

  .skill-title span {
    font-size: 16px;
    font-weight: 400;
    text-transform: capitalize;
    margin-left: 5px;
  }

  .progress {
    height: 10px;
    background-color: #3a4149;
    border-radius: 3px;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.6);
    -webkit-box-shadow: 0 0 1px rgba(0, 0, 0, 0.6);
  }

  .progress .progress-bar {
    float: left;
    height: 100%;
    font-size: 12px;
    line-height: 20px;
    color: #999;
    text-align: center;
    background-color: #337ab7;
    -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    transition: width 4s ease-in-out;
    -webkit-transition: width 4s ease-in-out;
  }

  .progress-bar {
    background-image: linear-gradient(to right, #337ab7, #68c3a3);
  }

  .progress-bar span {
    position: absolute;
    top: 0px;
    right: 15px;
  }
`;
