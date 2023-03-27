import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(value: Array<string>, args: string): any {

    if(!value){ return ; }

    const sortField = args[0]
    const sortField2 = args[1]
    const quantityFields = args[2]
    

    if (quantityFields === "2"){

    value.sort((a:any, b:any) => {
      if (a[sortField][sortField2].toLowerCase() < b[sortField][sortField2].toLowerCase()){
        return -1
      } else if (a[sortField][sortField2].toLowerCase() > b[sortField][sortField2].toLowerCase()){
        return 1
      } else {
        return 0
      }
    }
    );

    return value
  }


  if (quantityFields === "1"){
    value.sort((a:any, b:any) => {
      if (a[sortField].toLowerCase() < b[sortField].toLowerCase()){
        return -1
      } else if (a[sortField].toLowerCase() > b[sortField].toLowerCase()){
        return 1
      } else {
        return 0
      }
    }
    );

    return value
  }

  }

}
