import { useEffect, useState } from "react"
import { Text } from "react-native-elements"
import styles from "../styles"

type CountdownProps = {
    time: number
    capturing: boolean
}

export const Countdown = (props: CountdownProps) => {
    
    const [counter, setCounter] = useState(props.time)

    useEffect(()=> {
        counter > 0 && setTimeout(() => setCounter(counter - 1), 1000)
    }, [counter])
      return (
<Text style={styles.counter}>
{`Remaining Time: ${counter}s`}
</Text>
      )
}
