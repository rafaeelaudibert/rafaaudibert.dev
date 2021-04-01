import React from 'react';
import { Container } from 'components/common';
import contact from 'assets/illustrations/contact.svg';
import { Wrapper, Details, Thumbnail } from './styles';
import ContactForm from './ContactForm';

export const Contact = () => (
  <Wrapper as={Container} id="contact">
    <Details>
      <h1>Contact me!</h1>
      <ContactForm />
    </Details>
    <Thumbnail>
      <img src={contact} alt="I’m Rafa and I’m a Backend engineer!" />
    </Thumbnail>
  </Wrapper>
);
