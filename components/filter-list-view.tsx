import {Filter} from '../lib/database_utils';
import styles from './filter_list_view.module.css';
import {FunctionComponent} from 'react';

type Props = {
    filter: Filter,
    filterID: number,
    onClick: CallableFunction,
}

const FilterListView: FunctionComponent<Props> = ({filter, filterID, onClick}) => {
    return (
        <div>
            
        </div>
    );
}

export default FilterListView;