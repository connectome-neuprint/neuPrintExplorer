import React from 'react'

export default ({margin, width, height, backgroundColor, id, title})  => {
    const styles = {
        margin: margin + 'px',
        width: width + 'px',
        height: height + 'px',
        backgroundColor: backgroundColor,
        overflow: 'visible',
        display: 'inline-flex',
        flexDirection: 'row',
    }
    return <div style={styles} title={title}></div>
}