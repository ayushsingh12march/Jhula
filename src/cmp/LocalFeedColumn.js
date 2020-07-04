import React from 'react'
import {Grid,Header,Segment} from 'semantic-ui-react'
import {Messaging,PublicMethodsForRoom} from './SkylinkDemo'

const LocalFeedColumn = (props) => {
    const { stateKey, location } = props;
    return <Grid.Column width={6}>
    <Header as='div' attached='top'>
      <Header.Content style={{ padding: '0px' }}>{location.username} ({location.peerId})</Header.Content>
      <Messaging {...props} />
    </Header>
    <Segment attached>
      <video autoPlay muted style={{ width: '100%' }} controls={true} playsInline id={`local-feed_${stateKey}`} />
      <video autoPlay muted style={{ width: '100%' }} controls={true} playsInline id={`local-feed_screen_${stateKey}`} />
      <PublicMethodsForRoom {...props} />
    </Segment>
    </Grid.Column>
  }
export default LocalFeedColumn;