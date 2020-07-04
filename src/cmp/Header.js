import React, { Component } from 'react';
import { Container } from 'semantic-ui-react'

class Header extends Component {
  render() {
    return (
      <Container fluid className='skylink-header'>
          <p className='text-white'>
            JHULA Video Conferencing
          </p>
      </Container>
    )
  }
}

export default Header;