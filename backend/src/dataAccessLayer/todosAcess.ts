import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('dataAccessLayer/todosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME
    ) { }

    /**
     * creat todo item
     * @param TodoItem 
     * @returns 
     */
    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('---------Get todo item start---------------')

        const rs = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })
        .promise()

        const items = rs.Items
        logger.info('---------Get todo item end---------------',rs)
        return items as TodoItem[]
    }

    /**
     * creat todo item
     * @param TodoItem 
     * @returns 
     */
    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('---------Creat todo item start---------------')

        const rs = await this.docClient.put({
                TableName: this.todosTable,
                Item: todoItem
            })
            .promise()
        logger.info('---------Creat todo item end---------------',rs)
        return todoItem as TodoItem
    }

    /**
     * update todo item
     * 
     * @param userId 
     * @param todoId 
     * @param todoUpdate 
     */
    async updateTodoItem(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        logger.info('---------Update todo item start---------------')

        const rs = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done
            },
            ReturnValues: 'ALL_NEW'
        })
        .promise()
        const updateItem = rs.Attributes
        logger.info('---------Update todo item end---------------', rs)
        return updateItem as TodoUpdate
    }

    /**
     * delete todoitem.
     * 
     * @param todoId TodoID
     * @param userId UserId
     * @returns string
     */
    async deleteTodoItem(todoId: string, userId: string): Promise<string> {
        logger.info('---------Delete todo item start---------------')

        const rs = await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        })
        .promise()
        logger.info('---------Delete todo item end---------------', rs)
        return todoId as string
    }
}