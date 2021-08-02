import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { makeStyles } from '@material-ui/core';
import { getParams } from '../../functions/util';

import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import Hidden from '@material-ui/core/Hidden';
import PageWrapper from '../shared/page-wrapper';
import HomeDrawerList from './home-drawer-list';
import EventList from './list/event-list';
import EventDisplay from './event-display';
import Calendar from './calendar/calendar';
import Reservation from './reservation/reservation';
import ActionBar from './action-bar';

const drawerWidth = 280;
const useStyles = makeStyles({
    root: {},
    drawer: {
        width: drawerWidth,
    },
    spacer: {
        width: drawerWidth,
        marginBottom: '0',
    },
});

const Home = () => {
    const [display, setDisplay] = useState(null);
    const [view, setView] = useState('schedule');
    const [id, setId] = useState(null);
    const location = useLocation();
    const classes = useStyles();

    useEffect(() => {
        // Extract ID from url search params
        const newId = getParams('id');
        setId(newId);

        // If user has ID, send them to the display page
        if (newId) {
            console.log('?')
            setDisplay(<EventDisplay id={newId} />);
            return;
        }
    }, [location]);

    useEffect(() => {
        if (id) return;

        if (view === 'calendar') setDisplay(<Calendar />);
        else if (view === 'reservation') setDisplay(<Reservation />);
        else setDisplay(<EventList />);
    }, [view, id]);

    return (
        <PageWrapper noBottom>
            <Hidden smDown>
                <Drawer variant="permanent" className={classes.drawer}>
                    <Toolbar className={classes.spacer} />
                    <HomeDrawerList />
                </Drawer>
            </Hidden>
            <Box flexDirection="column" flexGrow={1} width={0} className={classes.root}>
                {id ? null : <ActionBar view={view} setView={setView} />}
                {display}
            </Box>
        </PageWrapper>
    );
};

export default Home;
