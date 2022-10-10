import styles from './selector.module.css';
import { FunctionComponent } from 'react';
import Image from 'next/image';

let defaultImage = '/icons/unknown.png';

export const WILDCARD_DEFAULT = 'Any';

type SelectorItemProps = {
    id: number,
    name: string,
    selected?: boolean,
    disabled?: boolean,
    imageUrl?: string,
    image?: any,
    onClick: CallableFunction
}

const SelectorItem: FunctionComponent<SelectorItemProps> = ({ id, name, selected, disabled, imageUrl, image, onClick }) => {
    // Use defaultImage if both url and image source are undefined
    let imageSrc = imageUrl ? imageUrl : (image ? image : defaultImage);

    let className = `${styles.itemContainer} ${selected ? styles.selected : ""} ${disabled ? styles.disabled : ""}`

    let onClickCallback = () => {
        if (!disabled) {
            onClick(id);
        }
    }

    return (
        <div className={className} onClick={onClickCallback} key={`${id}-${selected}`}>
            <Image
                className={styles.itemIcon}
                src={imageSrc}
                alt={name}
                layout={'responsive'} // lets image be resized
                height={'50px'}
                width={'50px'}
            />
            <div className={styles.itemLabelContainer}>
                <p className={styles.itemLabelText}>
                    {name}
                </p>
            </div>
        </div>
    )
}

type Props = {
    items: string[],
    selected: Map<string, boolean>,
    wildcard?: boolean,
    search?: boolean,
    onChanged?: CallableFunction,
}

const Selector: FunctionComponent<Props> = ({ items, selected, wildcard, search, onChanged }) => {
    // check if items includes wildcard. if not, insert into our list of items and map of what
    // items are selected.
    if (wildcard && items.indexOf(WILDCARD_DEFAULT)) {
        items = [WILDCARD_DEFAULT].concat(items);
        if (!selected.has(WILDCARD_DEFAULT)) {
            let newSelected = new Map(selected);
            newSelected.set(WILDCARD_DEFAULT, true);
            if (onChanged) { onChanged(newSelected); } // update map upstream
        }
    }

    const onClick = (id: number) => {
        // invert the selection for clicked item, then return the new selection state via callback.
        // Must(!!!) make a copy here or React won't recognize that a change has occurred.
        let newSelected = new Map(selected); // copy map
        let item = items[id];
        newSelected.set(item, !selected.get(item));

        if (onChanged) {
            onChanged(newSelected);
        }
    }

    return (
        <div className={styles.itemDisplay}>
            {items.map((item, index) => {
                let isSelected = selected.get(item);
                let disabled = false;
                // Disable every other item if wildcard is active and selected.
                if (wildcard && selected.get(WILDCARD_DEFAULT) && index !== 0) {
                    isSelected = false;
                    disabled = true;
                }

                return (
                    <SelectorItem
                        id={index}
                        name={item}
                        selected={isSelected}
                        disabled={disabled}
                        onClick={onClick}
                    />);
            })
            }
        </div>
    );
}

export default Selector;