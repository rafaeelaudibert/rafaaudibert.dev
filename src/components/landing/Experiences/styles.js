import styled from 'styled-components';
import detailsIllustration from 'assets/illustrations/details.svg';

export const Wrapper = styled.div`
  ::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: -1;
    background-image: url(${detailsIllustration});
    background-size: contain;
    background-position: left bottom;
    background-repeat: no-repeat;
    -webkit-transform: rotateY(180deg);
    transform: rotateY(180deg);
  }
`;

export const ExperiencesWrapper = styled.div`
  padding: 2.5rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

export const Details = styled.div`
  flex: 1;
  padding-left: 2rem;

  @media (max-width: 1200px) {
    padding-left: unset;
    width: 100%;
  }

  h1 {
    margin-bottom: 2rem;
    font-size: 26pt;
    color: #212121;
  }

  p {
    margin-bottom: 2.5rem;
    font-size: 20pt;
    font-weight: normal;
    line-height: 1.3;
    color: #707070;
  }
`;

export const Thumbnail = styled.div`
  flex: 1;

  @media (max-width: 1200px) {
    width: 100%;
    margin-bottom: 2rem;
    display: none;
  }

  img {
    width: 100%;
  }
`;
