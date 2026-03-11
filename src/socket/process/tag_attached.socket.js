exports.onTagAttached = function(socket , data , io){
    console.log('tag received', data)
    io.emit('on_tag_attached' , {
        ...data,
        status: 'Executé',
        color: 'green',
        receivedAt: "12:00"
    })
}