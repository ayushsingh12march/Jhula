import React from 'react'
import {Grid,Header,Segment} from 'semantic-ui-react'
const RemoteFeedColumn = (props) => {
    const { stateKey, location: { remotePeers } } = props;
    return <Grid.Column width={10}>
    <Header as='div' attached='top'>
      <Header.Content style={{ padding: '0px' }}>Remote Peers</Header.Content>
    </Header>
    <Segment attached>
    <Grid columns={4} padded>
    {
      remotePeers.map((peerId) => {
      return <Grid.Column key={peerId}>
        <label id={`remote-feed_peerId_${peerId}_${stateKey}`}>{peerId}</label>
        <video autoPlay playsInline controls={true} id={`remote-feed_${peerId}_${stateKey}`} style={{ width: '100%' }} />
        <video autoPlay playsInline controls={true} id={`remote-feed_screen_${peerId}_${stateKey}`} style={{ width: '50%' }} />
      <audio autoPlay playsInline id={`remote-feed_audio_${peerId}_${stateKey}`} style={{ width: '50%' }} />
      </Grid.Column>
    })
  }
  </Grid>
    </Segment>
    </Grid.Column>
  }
export default RemoteFeedColumn;