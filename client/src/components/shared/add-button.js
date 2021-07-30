import React from 'react';
import { redirect } from '../../functions/util';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'fixed',
        bottom: 36,
        right: 36,
        zIndex: theme.zIndex.appBar + 1,
    },
}));

// TODO: Add a tooltip to the floating action button
/**
 * Shows a floating action button
 * @param {object} props React props object
 * @param {Function} props.path Path to redirect to on click
 * @param {"default" | "inherit" | "primary" | "secondary"} props.color Color for FAB
 * @param {boolean} [props.edit] If true, will show edit button or else it'll show the add button
 */
const AddButton = (props) => {
    const classes = useStyles();

    const redirectTo = () => {
        redirect(props.path);
    };

    return (
        <Fab
            color={props.color || 'default'}
            aria-label={props.edit ? 'edit' : 'add'}
            onClick={redirectTo}
            className={classes.root}
        >
            {props.edit ? <EditIcon /> : <AddIcon htmlColor="white" />}
        </Fab>
    );
};

export default AddButton;
