import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Cookies from 'universal-cookie';
import { deleteAdminResource, getAdminResources } from '../../api';
import type { Resource, AdminResource, PopupEvent } from '../../types';
import { createPopupEvent } from '../../util';

import Box from '@mui/system/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FormWrapper from '../edit/shared/form-wrapper';
import ControlledSelect from '../edit/shared/controlled-select';
import ControlledTextField from '../edit/shared/controlled-text-field';
import Popup from '../shared/popup';

interface DeleteObject {
    /** Resource type to delete */
    resource: Resource;

    /** ID of resource to delete */
    id: string;

    /** Name of resource to delete */
    name: string;
}

const ManageResources = () => {
    const [resourceList, setResourceList] = useState<AdminResource[]>([]);
    const [resourceComponentList, setResourceComponentList] = useState([]);
    const [prevSearch, setPrevSearch] = useState(null);
    const [dataToDelete, setDataToDelete] = useState<DeleteObject>({ resource: 'events', id: '', name: '' });
    const [deletePrompt, setDeletePrompt] = useState(false);
    const [popupEvent, setPopupEvent] = useState<PopupEvent>(null);
    const [page, setPage] = useState(0);
    const { control, handleSubmit, setValue } = useForm();

    // On form submit, get resource list
    const onSubmit = async (data) => {
        // Invalid resource field
        if (data.resource === undefined) {
            setPopupEvent(createPopupEvent('Please select a resource to search for', 4));
            return;
        }

        // Invalid field/search fields
        if (data.field !== 'all' && (data.search === '' || data.search === undefined)) {
            setPopupEvent(createPopupEvent('Please enter a search term or select "Find All"', 4));
            return;
        }

        // Fetches the resource list and save it to the state variable
        const resourceRes = await getAdminResources(data.resource, data.field, data.search, 0);
        if (resourceRes.status === 200) {
            console.log(data);
            setPrevSearch(data);
            setPage(0);
            setResourceList(resourceRes.data);
        } else {
            setPopupEvent(createPopupEvent('Error getting resource list', 4));
        }
    };

    // On page change, get next set of resources and append it to the list
    const nextPage = async () => {
        const resourceRes = await getAdminResources(
            prevSearch.resource,
            prevSearch.field,
            prevSearch.search || 'none',
            page + 1
        );
        if (resourceRes.status === 200) {
            setPage(page + 1);
            setResourceList([...resourceList, ...resourceRes.data]);
        } else {
            setPopupEvent(createPopupEvent('Error getting additional resource list', 4));
        }
    };

    // This function will prompt the user first to see if they are sure they want to delete
    const promptDelete = (resource: Resource, id: string, name: string) => {
        setDataToDelete({ resource, id, name });
        setDeletePrompt(true);
    };

    // Actually delete the resource
    const deleteResource = async () => {
        setDeletePrompt(false);
        const res = await deleteAdminResource(dataToDelete.resource, dataToDelete.id);
        if (res.status === 200) {
            const cookies = new Cookies();
            cookies.set('success', `${dataToDelete.name} deleted successfully!`, { path: '/' });
            window.location.reload();
        } else {
            setPopupEvent(createPopupEvent('Error deleting resource', 4));
        }
    };

    // Create list of resource components
    // whenever the resourceList updates
    useEffect(() => {
        setResourceComponentList([
            ...resourceList.map((resource) => {
                return (
                    <ListItem key={resource.id}>
                        <ListItemText primary={resource.name} />
                        <IconButton
                            onClick={window.open.bind(
                                this,
                                prevSearch.resource === 'repeating-reservations'
                                    ? `${window.location.origin}/reservations/${resource.id}?repeating=true`
                                    : `${window.location.origin}/${prevSearch.resource}/${resource.id}`
                            )}
                        >
                            <VisibilityIcon />
                        </IconButton>
                        <IconButton onClick={promptDelete.bind(this, prevSearch.resource, resource.id, resource.name)}>
                            <DeleteOutlineIcon />
                        </IconButton>
                    </ListItem>
                );
            }),
            <ListItem key="next-page">
                {resourceList.length % 50 == 0 && resourceList.length !== 0 ? (
                    <Button onClick={nextPage}>Next Page</Button>
                ) : null}
            </ListItem>,
        ]);
    }, [resourceList]);

    return (
        <React.Fragment>
            <Popup event={popupEvent} />
            <Dialog
                open={deletePrompt}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">Delete {dataToDelete.resource}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete {dataToDelete.name}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={setDeletePrompt.bind(this, false)} color="error">
                        Cancel
                    </Button>
                    <Button onClick={deleteResource} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <FormWrapper onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: 'flex', flexDirection: 'row', marginBottom: 1 }}>
                    <ControlledSelect
                        control={control}
                        setValue={setValue}
                        name="resource"
                        label="Resource"
                        variant="standard"
                        sx={{ marginRight: 1 }}
                        wrapperSx={{ flexGrow: 1 }}
                        autoWidth
                    >
                        <MenuItem value="events">Events</MenuItem>
                        <MenuItem value="clubs">Clubs</MenuItem>
                        <MenuItem value="volunteering">Volunteering</MenuItem>
                        <MenuItem value="reservations">Reservations</MenuItem>
                        <MenuItem value="repeating-reservations">Repeating Reservations</MenuItem>
                    </ControlledSelect>
                    <ControlledSelect
                        control={control}
                        setValue={setValue}
                        name="field"
                        label="Field to Search"
                        variant="standard"
                        wrapperSx={{ flexGrow: 1 }}
                    >
                        <MenuItem value="all">Find All</MenuItem>
                        <MenuItem value="name">Name</MenuItem>
                        <MenuItem value="id">ID</MenuItem>
                    </ControlledSelect>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', marginBottom: 1 }}>
                    <ControlledTextField
                        control={control}
                        setValue={setValue}
                        value=""
                        label="Search"
                        name="search"
                        variant="standard"
                        fullWidth
                    />
                    <Button type="submit" sx={{ marginLeft: 1 }}>
                        Submit
                    </Button>
                </Box>
            </FormWrapper>
            <List sx={{ maxHeight: 500, overflowY: 'auto' }}>{resourceComponentList}</List>
        </React.Fragment>
    );
};

export default ManageResources;