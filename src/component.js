import React from "react"
import ReactDOM from "react-dom"

import "./component.scss"
import {ChevronDown, ChevronUp, CaretDown, CaretUp} from './icons'
import equal from 'fast-deep-equal'

export default class Dropdown extends React.Component {
    constructor (props, context) {
        super(props, context)

        this.state = {
            isOpen: false,
            filterValue: '',
            selectedValues: props.value ? props.value.toString().split(',') : [],
            selectedValue: props.value
        }
        this.myRef = React.createRef()

        document.addEventListener("click", this.hidePanel.bind(this), true)
    }

    componentWillUnmount () {
        document.removeEventListener("click", this.hidePanel.bind(this), true)
    }

    componentDidUpdate (prevProps) {
        const {value, multiple} = this.props
        if (!equal(value, prevProps.value)) {
            if (multiple) {
                this.setState({selectedValues: value.toString().split(',')})
            } else {
                this.setState({selectedValue: value})
            }
        }
    }

    clean (value) {
        this.setState({
            selectedValues: [],
            selectedValue: arguments.length ? value : (this.props.multiple ? [] : '')
        }, this.fireOnChange)
    }

    hidePanel (e) {
        if (!this.myRef.current) return

        const root = ReactDOM.findDOMNode(this.myRef.current)
        if (root && root.contains(e.target)) return

        this.setState({isOpen: false})
    }

    toggle () {
        this.setState({isOpen: !this.state.isOpen})
    }

    select (item) {
        const {multiple} = this.props
        if (multiple) return false

        this.setState({
            selectedValue: item.value,
            isOpen: false
        }, this.fireOnChange)
    }

    selectMultiple (e, item) {
        const checked = e.currentTarget.checked
        this.setState((prev) => {
            let {selectedValues} = prev
            if (checked) {
                selectedValues.push(item.value)
            } else {
                selectedValues = selectedValues.filter(val => val != item.value)
            }
            return {
                selectedValues
            }
        }, this.fireOnChange)
    }

    fireOnChange () {
        const {onChange} = this.props
        if (onChange) onChange(this.getSelected())
    }

    getSelected () {
        const {data, multiple} = this.props
        const {selectedValue, selectedValues} = this.state

        if (multiple) return data.filter(p => selectedValues.includes(p.value))
        return data.find(p => p.value === selectedValue) || {text: '', value: ''}
    }

    getUpOrDownIcon (isOpen) {
        if (isOpen) {
            return this.props.sign == 'caret' ? <CaretUp /> : <ChevronUp />
        } else {
            return this.props.sign == 'caret' ? <CaretDown /> : <ChevronDown />
        }
    }

    render () {
        const {data, multiple, optionRender, searchable, placeHolderStr, valueRender, searchIcon} = this.props
        const {isOpen, filterValue, selectedValues} = this.state
        const selected = this.getSelected()

        const getItemText = (item) => optionRender ? optionRender(item.text, item) : (item.text || item.value)
        const getDefaultVal = (item) => {
            if (multiple) {
                const snips = selected.map((p, i) => (<span key={`span-${i}`}>{getItemText(p)}</span>))
                return snips.length > 0 ? snips : placeHolderStr
            }
            return getItemText(item) || placeHolderStr
        }
        const getIfChecked = item => {
            if (multiple) return selected.find(p => p.value == item.value) !== undefined
            return selected.value == item.value
        }

        const list = filterValue ? data.filter(({text, value}) => ((text || value).toLowerCase().includes(filterValue.toLowerCase()) || selectedValues.includes(value))) : data
        return (
            <div ref={this.myRef} className={'lt-react-dropdown ' + (this.props.className || '')}>
                <div className="select" onClick={this.toggle.bind(this)}>
                    <span className="text">{!!searchIcon && <i className={searchIcon}></i>}{(valueRender || getDefaultVal)(selected)}</span>
                    {this.getUpOrDownIcon(isOpen)}
                </div>
                <div className={'panel' + (!this.state.isOpen && ' hide' || '')}>
                    {searchable && (
                        <input type="text" ref={input => input && input.focus()}
                            onChange={e => this.setState({filterValue: e.currentTarget.value})}
                        />
                    )}
                    <ul>
                        {list.map((item, i) => {
                            const boxID = `box-${i}`
                            return (
                                <li key={`index-${i}`}
                                    onClick={this.select.bind(this, item)}
                                    className={(getIfChecked(item) ? 'active' : '')}
                                >
                                    {multiple && (
                                        <input type="checkbox" id={boxID} checked={getIfChecked(item)}
                                            onChange={(e) => this.selectMultiple(e, item)}
                                        />
                                    )}
                                    {multiple
                                        ? <label htmlFor={boxID}>{getItemText(item)}</label>
                                        : getItemText(item)
                                    }
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        )
    }
}
