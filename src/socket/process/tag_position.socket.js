exports.onTagPosition= function(socket , data , io){

    console.log('tag position', data)

    io.emit('tag_position' , {
        ...data,
        status: 'Executé',
        color: 'green',
        receivedAt: "12:00"
    })
}