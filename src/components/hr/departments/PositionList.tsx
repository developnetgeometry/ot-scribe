import { useState } from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePositions, Position } from '@/hooks/hr/usePositions';
import { useDeletePosition } from '@/hooks/hr/useDeletePosition';
import { PositionDialog } from './PositionDialog';
import { Skeleton } from '@/components/ui/skeleton';

interface PositionListProps {
  departmentId: string;
}

export function PositionList({ departmentId }: PositionListProps) {
  const { data: positions, isLoading } = usePositions(departmentId);
  const deletePosition = useDeletePosition();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setShowDialog(true);
  };

  const handleDelete = (position: Position) => {
    setPositionToDelete(position);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (positionToDelete) {
      await deletePosition.mutateAsync({
        id: positionToDelete.id,
        departmentId: positionToDelete.department_id,
      });
      setShowDeleteDialog(false);
      setPositionToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!positions || positions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No positions added yet</p>
        <p className="text-sm">Click "Add Position" to create the first position</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {positions.map((position) => (
          <Card key={position.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{position.title}</h4>
                  <Badge variant={position.is_active ? 'default' : 'secondary'}>
                    {position.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {position.description && (
                  <p className="text-sm text-muted-foreground mb-2">{position.description}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{position.employee_count || 0} employee{position.employee_count !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(position)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(position)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <PositionDialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) setSelectedPosition(null);
        }}
        departmentId={departmentId}
        position={selectedPosition}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{positionToDelete?.title}"?
              {positionToDelete?.employee_count && positionToDelete.employee_count > 0 ? (
                <span className="block mt-2 text-destructive font-semibold">
                  This position has {positionToDelete.employee_count} employee(s) assigned.
                  You must reassign them before deleting.
                </span>
              ) : (
                <span className="block mt-2">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
