import React from 'react'

export default ({margin, width, height, backgroundColor, key, title})  => {
    const styles = {
        margin: margin + 'px',
        width: width + 'px',
        height: height + 'px',
        backgroundColor: backgroundColor,
        overflow: 'visible',
        display: 'inline-flex',
        flexDirection: 'row',
    }
    return <div key={key} style={styles} title={title}></div>
}